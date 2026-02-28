import { useState, useRef, useEffect, type ReactNode } from 'react';
import { toast } from 'sonner';

import { usePdfProcessing } from '@/hooks/usePdfProcessing.ts';
import { NER_MODELS, type NERModel } from '@/models/utils.ts';
import type { GroupedEntity } from '@/types/index.ts';
import { useAnonymization } from '@/hooks/useAnonymization.ts';
import { cn } from '@/lib/utils.ts';
import { SelectionPopover } from '@/components/workflow/SelectionPopover.tsx';

const PENDING_ID = '__pending__';

type PendingRange = { start: number; end: number; text: string };

type CreateTextPartsParams = {
  model: NERModel;
  text: string;
  entities: GroupedEntity[];
  highlightedEntityId: string | null;
  onEntityClick: (id: string) => void;
  pendingRange?: PendingRange | null;
};

const createTextParts = ({
  model,
  text,
  entities,
  highlightedEntityId,
  onEntityClick,
  pendingRange,
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
      const isIncluded = entity.included;

      textParts.push(
        <span
          key={entity.id}
          data-entity-id={entity.id}
          onClick={() => onEntityClick(entity.id)}
          className={cn(
            'inline cursor-pointer px-0.5 transition-all duration-150',
            isIncluded ? meta.highlight : 'border-b-2 border-gray-400 dark:border-gray-500',
            isSelected && 'ring-2 ring-offset-1 ring-accent',
          )}
        >
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
  onEntityClick: (id: string) => void;
}

export function PDFViewer({
  currentPage,
  zoom,
  entities,
  selectedEntityId,
  onEntityClick,
}: PDFViewerProps) {
  const { modelName, addEntity } = useAnonymization();
  const { extractedText } = usePdfProcessing();
  const containerRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<SelectionState | null>(null);

  const pageContent = extractedText[currentPage - 1] ?? extractedText[0];
  const pageEntities = entities.filter(e => e.page === currentPage).sort((a, b) => a.start - b.start);

  const textParts = createTextParts({
    model: modelName,
    text: pageContent.text,
    entities: pageEntities,
    highlightedEntityId: selectedEntityId,
    onEntityClick,
    pendingRange: selection,
  });

  const handleMouseUp = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      setSelection(null);
      return;
    }

    const selectedText = sel.toString().trim();
    if (!selectedText || !containerRef.current) {
      setSelection(null);
      return;
    }

    const range = sel.getRangeAt(0);

    // Verify the selection is inside the text container
    if (!containerRef.current.contains(range.commonAncestorContainer)) {
      setSelection(null);
      return;
    }

    // Calculate absolute start offset relative to pageContent.text
    const preRange = document.createRange();
    preRange.selectNodeContents(containerRef.current);
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

  // Scroll selected entity into view when selection changes
  useEffect(() => {
    if (!selectedEntityId || !containerRef.current) return;
    const el = containerRef.current.querySelector(`[data-entity-id="${selectedEntityId}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selectedEntityId]);

  // Dismiss popover on click outside the popover itself
  useEffect(() => {
    if (!selection) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      // Only dismiss if click is not inside the text container or a popover
      const isInsideContainer = containerRef.current?.contains(target);
      const isInsidePopover = (target as HTMLElement).closest?.('[data-popover]');
      if (!isInsideContainer && !isInsidePopover) {
        dismissSelection();
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [selection]);

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
          ref={containerRef}
          onMouseUp={handleMouseUp}
          className="font-mono text-[13px] leading-[1.9] text-gray-800 dark:text-gray-200 whitespace-pre-wrap select-text"
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
