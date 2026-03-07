import { useState, useRef, useEffect, useCallback } from 'react';
import type { DragState } from '@/lib/pdf/createTextParts.ts';
import type { GroupedEntity } from '@/types/index.ts';

export function useEntityDrag(
  pageEntities: GroupedEntity[],
  pageText: string,
  containerRef: HTMLDivElement | null,
  onEntityUpdate: (entityId: string, updates: Partial<GroupedEntity>) => void,
) {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const dragStateRef = useRef<DragState | null>(null);

  useEffect(() => {
    dragStateRef.current = dragState;
  }, [dragState]);

  const measureCharWidth = useCallback((): number => {
    if (!containerRef) return 7.8;

    const walker = document.createTreeWalker(containerRef, NodeFilter.SHOW_TEXT);
    const firstText = walker.nextNode();

    if (!firstText?.textContent) return 7.8;

    const range = document.createRange();
    range.setStart(firstText, 0);
    range.setEnd(firstText, 1);

    return range.getBoundingClientRect().width || 7.8;
  }, [containerRef]);

  const startDrag = (e: React.MouseEvent, entityId: string, handle: 'left' | 'right') => {
    e.preventDefault();
    e.stopPropagation();
    const entity = pageEntities.find(en => en.id === entityId);
    if (!entity) return;

    const sorted = [...pageEntities].sort((a, b) => a.start - b.start);
    const idx = sorted.findIndex(en => en.id === entityId);
    const minStart = idx > 0 ? sorted[idx - 1].end : 0;
    const maxEnd = idx < sorted.length - 1 ? sorted[idx + 1].start : pageText.length;

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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const ds = dragStateRef.current;
      if (!ds) return;

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

      const newText = pageText.slice(ds.previewStart, ds.previewEnd);
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
  }, [onEntityUpdate, pageText]);

  return { dragState, dragStateRef, startDrag };
}
