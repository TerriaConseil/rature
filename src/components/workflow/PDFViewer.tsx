import { useState, useRef, useEffect, type ReactNode, useCallback } from 'react';
import { toast } from 'sonner';

import { usePdfProcessing } from '@/hooks/usePdfProcessing.ts';
import { NER_MODELS, type NERModel } from '@/models/utils.ts';
import type { GroupedEntity } from '@/types/index.ts';
import { useAnonymization } from '@/hooks/useAnonymization.ts';
import { cn } from '@/lib/utils.ts';
import { SelectionPopover } from '@/components/workflow/SelectionPopover.tsx';

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
  onDragStart?: (e: React.MouseEvent, entityId: string, handle: 'left' | 'right') => void;
  isDragging?: boolean;
};

const createTextParts = ({
  model,
  text,
  entities,
  highlightedEntityId,
  highlightedEntityText,
  onEntityClick,
  pendingRange,
  onDragStart,
  isDragging,
}: CreateTextPartsParams) => {
  // Merge entities and the pending range into a single sorted list
  type SpanItem =
    | { kind: 'entity'; data: GroupedEntity }
    | { kind: 'pending'; start: number; end: number; text: string };

  const items: SpanItem[] = entities.map(e => ({ kind: 'entity', data: e }));
  if (pendingRange) {
    items.push({ kind: 'pending', ...pendingRange });
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
    } else {
      const entity = item.data;
      const meta = NER_MODELS[model].entities[entity.type];
      const isSelected = !!highlightedEntityId && highlightedEntityId === entity.id;
      const isHighlightedAll = !!highlightedEntityText && entity.text === highlightedEntityText && !isSelected;
      const isIncluded = entity.included;

      textParts.push(
        <span
          key={entity.id}
          data-entity-id={entity.id}
          onClick={() => !isDragging && onEntityClick(entity.id)}
          className={cn(
            'cursor-pointer px-0.5 transition-all duration-150',
            isSelected ? 'inline-block relative group' : 'inline',
            isIncluded ? meta.highlight : 'border-b-2 border-gray-400 dark:border-gray-500',
            isSelected && 'ring-2 ring-offset-1 ring-accent',
            isHighlightedAll && 'ring-2 ring-offset-1 ring-accent/40',
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
};

interface PDFViewerProps {
  currentPage: number;
  zoom: number;
  entities: GroupedEntity[];
  selectedEntityId: string | null;
  highlightedEntityText?: string | null;
  onEntityClick: (id: string) => void;
  onEntityUpdate: (entityId: string, updates: Partial<GroupedEntity>) => void;
}

export function PDFViewer({
  currentPage,
  zoom,
  entities,
  selectedEntityId,
  highlightedEntityText,
  onEntityClick,
  onEntityUpdate,
}: PDFViewerProps) {
  const { modelName, addEntity } = useAnonymization();
  const { extractedText } = usePdfProcessing();
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  // Ref so event handlers always see the latest drag state without stale closures
  const dragStateRef = useRef<DragState | null>(null);

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

  const textParts = createTextParts({
    model: modelName,
    text: pageContent.text,
    entities: displayEntities,
    highlightedEntityId: selectedEntityId,
    highlightedEntityText,
    onEntityClick,
    pendingRange: selection,
    onDragStart: startDrag,
    isDragging: !!dragState,
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

    setSelection({ text: selectedText, start: startOffset, end: endOffset, position: { x, y } });
    // Clear native browser selection — our pending span takes over visually
    window.getSelection()?.removeAllRanges();
    // Clear currently selected entity
    if (selectedEntityId) {
      onEntityClick(selectedEntityId);
    }
  };

  const handleAddEntity = (type: string) => {
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

    const newEntity: GroupedEntity = {
      id: crypto.randomUUID(),
      text: selection.text,
      type,
      score: 1.0,
      page: currentPage,
      start: selection.start,
      end: selection.end,
      included: true,
    };

    addEntity(newEntity);
    onEntityClick(newEntity.id);
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

  return (
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
            entityTypes={NER_MODELS[modelName].entities}
            onSelectType={handleAddEntity}
            onDismiss={dismissSelection}
          />
        </div>
      )}
    </div>
  );
}
