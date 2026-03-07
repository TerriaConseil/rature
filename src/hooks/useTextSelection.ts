import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { findAllOccurrences, type EntityMatch } from '@/lib/entity-expansion.ts';
import type { TextExtract } from '@/context/pdfProcessing.tsx';
import type { GroupedEntity } from '@/types/index.ts';

export type SelectionState = {
  text: string;
  start: number;
  end: number;
  position: { x: number; y: number };
  allMatches: EntityMatch[];
};

export function useTextSelection(
  containerRef: HTMLDivElement | null,
  extractedText: TextExtract[],
  entities: GroupedEntity[],
  pageEntities: GroupedEntity[],
  currentPage: number,
  selectedEntityId: string | null,
  addEntity: (entity: GroupedEntity) => void,
  onEntityClick: (id: string) => void,
) {
  const [selection, setSelection] = useState<SelectionState | null>(null);

  const dismissSelection = () => {
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleMouseUp = (isDragging: boolean) => {
    if (isDragging) return;

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
    if (!containerRef.contains(range.commonAncestorContainer)) {
      setSelection(null);
      return;
    }

    const preRange = document.createRange();
    preRange.selectNodeContents(containerRef);
    preRange.setEnd(range.startContainer, range.startOffset);
    const startOffset = preRange.toString().length;
    const endOffset = startOffset + selectedText.length;

    const rect = range.getBoundingClientRect();
    const x = (rect.left + rect.right) / 2;
    const y = rect.bottom;

    const allMatches = findAllOccurrences(selectedText, extractedText, entities);

    setSelection({ text: selectedText, start: startOffset, end: endOffset, position: { x, y }, allMatches });
    window.getSelection()?.removeAllRanges();
    if (selectedEntityId) {
      onEntityClick(selectedEntityId);
    }
  };

  const handleAddEntity = (addAll: boolean) => {
    if (!selection) return;

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

  // Scroll selected entity into view when selection changes
  useEffect(() => {
    if (!selectedEntityId || !containerRef) return;
    const el = containerRef.querySelector(`[data-entity-id="${selectedEntityId}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [containerRef, selectedEntityId]);

  // Dismiss popover on click outside
  useEffect(() => {
    if (!selection) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      const isInsideContainer = containerRef?.contains(target);
      const isInsidePopover = (target as HTMLElement).closest?.('[data-popover]');

      if (!isInsideContainer && !isInsidePopover) {
        dismissSelection();
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [containerRef, selection]);

  return { selection, handleMouseUp, handleAddEntity, dismissSelection };
}
