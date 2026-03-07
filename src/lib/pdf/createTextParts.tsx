import { type ReactNode } from 'react';
import { NER_MODELS, type NERModel } from '@/models/utils.ts';
import { cn } from '@/lib/utils.ts';
import type { EntityMatch } from '@/lib/entity-expansion.ts';
import type { GroupedEntity } from '@/types/index.ts';

const PENDING_ID = '__pending__';

export type PendingRange = { start: number; end: number; text: string };

export type DragState = {
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

export type CreateTextPartsParams = {
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

export function createTextParts({
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
}: CreateTextPartsParams): ReactNode[] {
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
    if (cursor > itemStart) continue;

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
}
