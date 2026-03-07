import { useState, useRef, useEffect, type ReactNode, useCallback } from 'react';
import { Search, ChevronUp, ChevronDown, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button.tsx';
import { SelectionPopover } from '@/components/workflow/SelectionPopover.tsx';
import { useAnonymization } from '@/hooks/useAnonymization.ts';
import { usePdfProcessing } from '@/hooks/usePdfProcessing.ts';
import { findAllOccurrences, type EntityMatch } from '@/lib/entity-expansion.ts';
import { cn } from '@/lib/utils.ts';
import { NER_MODELS, type NERModel } from '@/models/utils.ts';
import type { GroupedEntity } from '@/types/index.ts';

const PENDING_ID = '__pending__';

type PendingRange = { start: number; end: number; text: string };

type DragState = {
  entityId: string;
  handle: 'left' | 'right';
  originalStart: number;
  originalEnd: number;
  minStart: number;
  maxEnd: number;
  startMouseX: number;
  charWidth: number;
  previewStart: number;
  previewEnd: number;
};

type CreateTextPartsParams = {
  model: NERModel;
  text: string;
  entities: GroupedEntity[];
  highlightedEntityId: string | null;
  highlightedEntityText?: string | null;
  onEntityClick: (id: string) => void;
  pendingRange?: PendingRange | null;
  previewMatches?: EntityMatch[];
  onDragStart?: (e: React.MouseEvent, entityId: string, handle: 'left' | 'right') => void;
  isDragging?: boolean;
  focusedMatchStart?: number;
  dimEntities?: boolean;
};

const createTextParts = ({
  model,
  text,
  entities,
  highlightedEntityId,
  highlightedEntityText,
  onEntityClick,
  pendingRange,
  previewMatches,
  onDragStart,
  isDragging,
  focusedMatchStart,
  dimEntities,
}: CreateTextPartsParams) => {
  // Merge entities, the pending range, and preview matches into a single sorted list
  type SpanItem =
    | { kind: 'entity'; data: GroupedEntity }
    | { kind: 'pending'; start: number; end: number; text: string }
    | { kind: 'preview'; start: number; end: number; text: string };

  const items: SpanItem[] = entities.map(e => ({ kind: 'entity', data: e }));
  if (pendingRange) {
    items.push({ kind: 'pending', ...pendingRange });
  }
  if (previewMatches) {
    for (const m of previewMatches) {
      items.push({ kind: 'preview', start: m.start, end: m.end, text: m.text });
    }
  }
  items.sort((a, b) => {
    const aStart = a.kind === 'entity' ? a.data.start : a.start;
    const bStart = b.kind === 'entity' ? b.data.start : b.start;
    return aStart - bStart;
  });

  const textParts: ReactNode[] = [];
  let cursor = 0;

  for (const item of items) {
    const itemStart = item.kind === 'entity' ? item.data.start : item.start;
    const itemEnd = item.kind === 'entity' ? item.data.end : item.end;
    const itemText = item.kind === 'entity' ? item.data.text : item.text;

    if (!itemText) continue;
    if (cursor > itemStart) continue; // skip overlaps (shouldn't happen)

    if (cursor < itemStart) {
      textParts.push(
        <span key={crypto.randomUUID()} data-offset={cursor}>
          {text.slice(cursor, itemStart)}
        </span>
      );
    }

    if (item.kind === 'pending') {
      textParts.push(
        <span
          key={PENDING_ID}
          className="inline px-0.5 bg-accent/10 border-b-2 border-dashed border-accent dark:bg-accent/15"
        >
          {itemText}
        </span>
      );
    } else if (item.kind === 'preview') {
      const isFocused = item.start === focusedMatchStart;
      textParts.push(
        <span
          key={`preview-${item.start}-${item.end}`}
          {...(isFocused ? { 'data-search-match': 'focused' } : {})}
          className={isFocused
            ? "inline px-0.5 bg-accent/10 border-b-2 border-dashed border-accent dark:bg-accent/15"
            : "inline px-0.5 bg-accent/5 border-b-2 border-dashed border-accent/40 dark:bg-accent/8"
          }
        >
          {itemText}
        </span>
      );
    } else {
      const entity = item.data;
      const meta = NER_MODELS[model].entities[entity.type];
      const isSelected = !!highlightedEntityId && highlightedEntityId === entity.id;
      const isHighlightedAll = !!highlightedEntityText && entity.text === highlightedEntityText && !isSelected;
      const isIncluded = entity.included;

      const focusedPreviewMatch = previewMatches?.find(m => m.start === focusedMatchStart);
      const overlapsFocused = focusedPreviewMatch
        ? focusedPreviewMatch.start < entity.end && focusedPreviewMatch.end > entity.start
        : false;
      const overlapsSearch = !overlapsFocused && (previewMatches?.some(
        m => m.start < entity.end && m.end > entity.start
      ) ?? false);

      textParts.push(
        <span
          key={entity.id}
          data-entity-id={entity.id}
          {...(overlapsFocused ? { 'data-search-match': 'focused' } : {})}
          onClick={() => !isDragging && onEntityClick(entity.id)}
          className={cn(
            'cursor-pointer px-0.5 transition-all duration-150',
            isSelected ? 'inline-block relative group' : 'inline',
            overlapsFocused
              ? 'bg-accent/10 border-b-2 border-dashed border-accent dark:bg-accent/15'
              : overlapsSearch
                ? 'bg-accent/5 border-b-2 border-dashed border-accent/40 dark:bg-accent/8'
                : dimEntities
                  ? 'border-b-2 border-gray-300 dark:border-gray-600'
                  : isIncluded ? meta.highlight : 'border-b-2 border-gray-400 dark:border-gray-500',
            !dimEntities && !overlapsFocused && !overlapsSearch && isSelected && 'ring-2 ring-offset-1 ring-accent',
            !dimEntities && !overlapsFocused && !overlapsSearch && isHighlightedAll && 'ring-2 ring-offset-1 ring-accent/40',
          )}
        >
          {isSelected && onDragStart && (
            <>
              <span
                aria-label="Étendre à gauche"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-4 rounded-sm bg-accent cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                onMouseDown={e => onDragStart(e, entity.id, 'left')}
              />
              <span
                aria-label="Étendre à droite"
                className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-4 rounded-sm bg-accent cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                onMouseDown={e => onDragStart(e, entity.id, 'right')}
              />
            </>
          )}
          {entity.text}
        </span>
      );
    }

    cursor = itemEnd;
  }

  if (cursor < text.length) {
    textParts.push(<span key="tail" data-offset={cursor}>{text.slice(cursor)}</span>);
  }

  return textParts;
};

type SelectionState = {
  text: string;
  start: number;
  end: number;
  position: { x: number; y: number };
  allMatches: EntityMatch[];
};

interface PDFViewerProps {
  currentPage: number;
  zoom: number;
  entities: GroupedEntity[];
  selectedEntityId: string | null;
  highlightedEntityText?: string | null;
  onEntityClick: (id: string) => void;
  onEntityUpdate: (entityId: string, updates: Partial<GroupedEntity>) => void;
  onPageChange: (page: number) => void;
}

export function PDFViewer({
  currentPage,
  zoom,
  entities,
  selectedEntityId,
  highlightedEntityText,
  onEntityClick,
  onEntityUpdate,
  onPageChange,
}: PDFViewerProps) {
  const { modelName, addEntity } = useAnonymization();
  const { extractedText } = usePdfProcessing();
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  // Ref so event handlers always see the latest drag state without stale closures
  const dragStateRef = useRef<DragState | null>(null);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchMatches, setSearchMatches] = useState<EntityMatch[]>([]);
  const [searchMatchIndex, setSearchMatchIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const pageContent = extractedText[currentPage - 1] ?? extractedText[0];
  const pageEntities = entities.filter(e => e.page === currentPage).sort((a, b) => a.start - b.start);

  // During drag, override the dragged entity's bounds for real-time preview
  const displayEntities = dragState
    ? pageEntities.map(e =>
        e.id === dragState.entityId
          ? { ...e, start: dragState.previewStart, end: dragState.previewEnd, text: pageContent.text.slice(dragState.previewStart, dragState.previewEnd) }
          : e
      )
    : pageEntities;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedQuery.length < 3) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchMatches([]);
      setSearchMatchIndex(0);
      return;
    }
    const matches = findAllOccurrences(debouncedQuery, extractedText, []);
    setSearchMatches(matches);
    setSearchMatchIndex(0);
    if (matches.length > 0) onPageChange(matches[0].page);
  }, [debouncedQuery, extractedText, onPageChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [searchOpen]);

  const navigateMatch = (direction: 'prev' | 'next') => {
    if (searchMatches.length === 0) return;
    const newIndex = direction === 'next'
      ? (searchMatchIndex + 1) % searchMatches.length
      : (searchMatchIndex - 1 + searchMatches.length) % searchMatches.length;
    setSearchMatchIndex(newIndex);
    onPageChange(searchMatches[newIndex].page);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
    setDebouncedQuery('');
    setSearchMatches([]);
    setSearchMatchIndex(0);
  };

  const measureCharWidth = useCallback((): number => {
    if (!containerRef) return 7.8;

    const walker = document.createTreeWalker(containerRef, NodeFilter.SHOW_TEXT);
    const firstText = walker.nextNode();

    if (!firstText?.textContent) return 7.8;

    const range = document.createRange();

    range.setStart(firstText, 0);
    range.setEnd(firstText, 1);

    const charWidth = range.getBoundingClientRect().width || 7.8;

    return charWidth;
  }, [containerRef]);

  const startDrag = (e: React.MouseEvent, entityId: string, handle: 'left' | 'right') => {
    e.preventDefault();
    e.stopPropagation();
    const entity = pageEntities.find(en => en.id === entityId);

    if (!entity) return;

    // Compute clamping bounds once so the effect never needs pageEntities
    const sorted = [...pageEntities].sort((a, b) => a.start - b.start);
    const idx = sorted.findIndex(en => en.id === entityId);
    const minStart = idx > 0 ? sorted[idx - 1].end : 0;
    const maxEnd = idx < sorted.length - 1 ? sorted[idx + 1].start : pageContent.text.length;

    setDragState({
      entityId,
      handle,
      originalStart: entity.start,
      originalEnd: entity.end,
      minStart,
      maxEnd,
      startMouseX: e.clientX,
      charWidth: measureCharWidth(),
      previewStart: entity.start,
      previewEnd: entity.end,
    });
  };

  // Register global listeners once; read live state from ref to avoid stale closures.
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const ds = dragStateRef.current;
      if (!ds) return;

      // Delta-based: convert pixel offset from drag-start into character count.
      // This is robust against DOM layout changes caused by entity preview updates.
      const deltaChars = Math.round((e.clientX - ds.startMouseX) / ds.charWidth);

      setDragState(prev => {
        if (!prev) return null;

        if (prev.handle === 'left') {
          const newStart = Math.max(prev.minStart, Math.min(prev.originalStart + deltaChars, prev.previewEnd - 1));

          return { ...prev, previewStart: newStart };
        } else {
          const newEnd = Math.min(prev.maxEnd, Math.max(prev.originalEnd + deltaChars, prev.previewStart + 1));

          return { ...prev, previewEnd: newEnd };
        }
      });
    };

    const handleMouseUp = () => {
      const ds = dragStateRef.current;

      if (!ds) return;

      const newText = pageContent.text.slice(ds.previewStart, ds.previewEnd);

      if (newText.trim()) {
        onEntityUpdate(ds.entityId, { start: ds.previewStart, end: ds.previewEnd, text: newText });
      }

      setDragState(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onEntityUpdate, pageContent.text]);

  // Preview matches: selection previews when selecting, search matches when searching
  const currentPagePreviewMatches = selection
    ? selection.allMatches.filter(
        m => m.page === currentPage && !(m.start === selection.start && m.end === selection.end)
      )
    : debouncedQuery.length >= 3
      ? searchMatches.filter(m => m.page === currentPage)
      : undefined;

  const focusedMatch = searchMatches[searchMatchIndex];
  const focusedMatchStart = !selection && focusedMatch?.page === currentPage
    ? focusedMatch.start
    : undefined;

  const textParts = createTextParts({
    model: modelName,
    text: pageContent.text,
    entities: displayEntities,
    highlightedEntityId: selectedEntityId,
    highlightedEntityText,
    onEntityClick,
    pendingRange: selection,
    previewMatches: currentPagePreviewMatches,
    onDragStart: startDrag,
    isDragging: !!dragState,
    focusedMatchStart,
    dimEntities: !selection && searchMatches.length > 0,
  });

  const handleMouseUp = () => {
    // Don't open selection popover while dragging
    if (dragStateRef.current) return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      setSelection(null);
      return;
    }

    const selectedText = sel.toString().trim();
    if (!selectedText || !containerRef) {
      setSelection(null);
      return;
    }

    const range = sel.getRangeAt(0);

    // Verify the selection is inside the text container
    if (!containerRef.contains(range.commonAncestorContainer)) {
      setSelection(null);
      return;
    }

    // Calculate absolute start offset relative to pageContent.text
    const preRange = document.createRange();
    preRange.selectNodeContents(containerRef);
    preRange.setEnd(range.startContainer, range.startOffset);
    const startOffset = preRange.toString().length;
    const endOffset = startOffset + selectedText.length;

    // Position: center-bottom of the selection rectangle
    const rect = range.getBoundingClientRect();
    const x = (rect.left + rect.right) / 2;
    const y = rect.bottom;

    // Find all occurrences across all pages (excluding already-existing entities)
    const allMatches = findAllOccurrences(selectedText, extractedText, entities);

    setSelection({ text: selectedText, start: startOffset, end: endOffset, position: { x, y }, allMatches });
    // Clear native browser selection — our pending span takes over visually
    window.getSelection()?.removeAllRanges();
    // Clear currently selected entity
    if (selectedEntityId) {
      onEntityClick(selectedEntityId);
    }
  };

  const handleAddEntity = (addAll: boolean) => {
    if (!selection) return;

    // Check for overlap with existing entities on this page
    const overlaps = pageEntities.some(
      e => e.start < selection.end && e.end > selection.start
    );

    if (overlaps) {
      toast.warning("Cette sélection chevauche une entité existante.");
      setSelection(null);
      window.getSelection()?.removeAllRanges();
      return;
    }

    if (addAll && selection.allMatches.length > 0) {
      // Add all discovered occurrences across all pages
      let firstId: string | null = null;
      for (const match of selection.allMatches) {
        const newEntity: GroupedEntity = {
          id: crypto.randomUUID(),
          text: match.text,
          type: 'MANUAL',
          score: 1.0,
          page: match.page,
          start: match.start,
          end: match.end,
          included: true,
        };
        if (!firstId) firstId = newEntity.id;
        addEntity(newEntity);
      }
      if (firstId) onEntityClick(firstId);
    } else {
      // Add only the currently selected occurrence
      const newEntity: GroupedEntity = {
        id: crypto.randomUUID(),
        text: selection.text,
        type: 'MANUAL',
        score: 1.0,
        page: currentPage,
        start: selection.start,
        end: selection.end,
        included: true,
      };
      addEntity(newEntity);
      onEntityClick(newEntity.id);
    }

    setSelection(null);
    window.getSelection()?.removeAllRanges();
  };

  const dismissSelection = () => {
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  };

  useEffect(() => {
    dragStateRef.current = dragState;
  }, [dragState]);

  // Scroll selected entity into view when selection changes
  useEffect(() => {
    if (!selectedEntityId || !containerRef) return;

    const el = containerRef.querySelector(`[data-entity-id="${selectedEntityId}"]`);

    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [containerRef, selectedEntityId]);

  // Scroll focused search match into view when index or page changes
  useEffect(() => {
    if (!containerRef || searchMatches.length === 0) return;

    const el = containerRef.querySelector('[data-search-match="focused"]');
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [containerRef, searchMatchIndex, currentPage, searchMatches.length]);

  // Dismiss popover on click outside the popover itself
  useEffect(() => {
    if (!selection) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      // Only dismiss if click is not inside the text container or a popover
      const isInsideContainer = containerRef?.contains(target);
      const isInsidePopover = (target as HTMLElement).closest?.('[data-popover]');

      if (!isInsideContainer && !isInsidePopover) {
        dismissSelection();
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [containerRef, selection]);

  const isMac = typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.userAgent);

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      <div className="absolute top-4 right-2 flex items-center justify-end px-4 h-8 bg-transparent shrink-0">
        <Button
          onClick={() => setSearchOpen(true)}
          title="Rechercher dans le document"
          variant="secondary"
          className={cn(
            "group",
            searchOpen && 'hidden',
          )}
        >
          <Search size={16} className="group-hover:text-accent transition-colors duration-300 shrink-0" />
          <p className="max-w-0 group-hover:max-w-2xl transition-all duration-200 overflow-hidden">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Rechercher dans le document</span>
          </p>
          <kbd className="ml-0.5 px-1.5 py-0.5 text-[10px] font-mono leading-none bg-white dark:bg-[#1a1a24] border border-border rounded shadow-sm text-fg-muted">
            {isMac ? '⌘F' : 'Ctrl F'}
          </kbd>
        </Button>
      </div>

      <div
        className={cn(
          'absolute top-4 right-6 z-20',
          'flex items-center gap-1.5 pl-3 pr-2 py-1.5',
          'bg-white dark:bg-[#2a2a36]',
          'border-2 border-transparent rounded-xl shadow-xl',
          'focus-within:border-accent',
          'transition-all duration-200 ease-out',
          searchOpen
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none',
        )}
      >
        <Search className="w-3.5 h-3.5 text-fg-muted shrink-0" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Escape') closeSearch();
            if (e.key === 'Enter') navigateMatch(e.shiftKey ? 'prev' : 'next');
          }}
          placeholder="Rechercher dans le document…"
          className="w-52 text-sm bg-transparent outline-none text-fg placeholder:text-fg-muted caret-accent"
        />
        {debouncedQuery.length >= 3 && (
          <span className="text-xs text-fg-muted tabular-nums font-mono shrink-0 min-w-14 text-right">
            {searchMatches.length > 0
              ? `${searchMatchIndex + 1} / ${searchMatches.length}`
              : 'Aucun'}
          </span>
        )}
        <div className="flex items-center gap-0.5 ml-0.5">
          <button
            onClick={() => navigateMatch('prev')}
            disabled={searchMatches.length === 0}
            aria-label="Occurrence précédente"
            className="p-1 rounded-lg hover:bg-surface-subtle disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => navigateMatch('next')}
            disabled={searchMatches.length === 0}
            aria-label="Occurrence suivante"
            className="p-1 rounded-lg hover:bg-surface-subtle disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={closeSearch}
            aria-label="Fermer la recherche"
            className="p-1 rounded-lg hover:bg-surface-subtle transition-colors ml-0.5"
          >
            <X className="w-3.5 h-3.5 text-fg-muted" />
          </button>
        </div>
      </div>

      {/* ── Scrollable PDF area ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto bg-surface-subtle flex justify-center py-16 px-4">
        <div
          className="bg-white dark:bg-[#2a2a36] rounded-lg shadow-lg w-full max-w-2xl min-h-210.5 p-12 relative self-start"
          style={{
            boxShadow: '0 4px 32px rgb(0 0 0 / 0.12)',
            zoom: zoom / 100,
          }}
        >
          <div className="absolute top-3 right-4 text-xs text-gray-400 tabular-nums">
            Page {currentPage}
          </div>

          <div
            ref={setContainerRef}
            onMouseUp={handleMouseUp}
            className={cn(
              'font-mono text-[13px] leading-[1.9] text-gray-800 dark:text-gray-200 whitespace-pre-wrap select-text',
              dragState && 'select-none cursor-ew-resize',
            )}
          >
            {textParts}
          </div>
        </div>

        {selection && (
          <div data-popover>
            <SelectionPopover
              selectedText={selection.text}
              position={selection.position}
              matchCount={selection.allMatches.length}
              onCreate={() => handleAddEntity(false)}
              onCreateAll={() => handleAddEntity(true)}
              onDismiss={dismissSelection}
            />
          </div>
        )}
      </div>
    </div>
  );
}
