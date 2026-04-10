import React, { useState, useEffect, useMemo } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { DeleteEntityDialog } from '@/components/workflow/DeleteEntityDialog.tsx';
import { DocumentSearchBar } from '@/components/workflow/DocumentSearchBar.tsx';
import { EmptyPDFPage } from '@/components/workflow/EmptyPDFPage.tsx';
import { FeedbackModal } from '@/components/workflow/FeedbackModal.tsx';
import { SelectionPopover } from '@/components/workflow/SelectionPopover.tsx';
import { useAnonymization } from '@/hooks/useAnonymization.ts';
import { useDocumentSearch } from '@/hooks/useDocumentSearch.ts';
import { useEntityDrag } from '@/hooks/useEntityDrag.ts';
import { useTextSelection } from '@/hooks/useTextSelection.ts';
import { usePdfProcessing } from '@/hooks/usePdfProcessing.ts';
import { createTextParts } from '@/lib/pdf/createTextParts.tsx';
import { cn } from '@/lib/utils.ts';
import type { GroupedEntity } from '@/types/index.ts';

interface PDFViewerProps {
  currentPage: number;
  zoom: number;
  entities: GroupedEntity[];
  selectedEntityId: string | null;
  highlightedEntityText?: string | null;
  isSidebarCollapsed: boolean;
  onEntityClick: (id: string) => void;
  onEntityUpdate: (entityId: string, updates: Partial<GroupedEntity>) => void;
  onPageChange: (page: number) => void;
  onEntityDeleteOne?: (id: string) => void;
  onEntityDeleteAll?: (text: string) => void;
}

export const PDFViewer = React.memo(function PDFViewer({
  currentPage,
  zoom,
  entities,
  selectedEntityId,
  highlightedEntityText,
  isSidebarCollapsed,
  onEntityClick,
  onEntityUpdate,
  onPageChange,
  onEntityDeleteOne,
  onEntityDeleteAll,
}: PDFViewerProps) {
  const { t } = useTranslation();
  const { modelName, addEntity } = useAnonymization();
  const { extractedText } = usePdfProcessing();
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  type DeleteConfirm = { entityId: string; entityText: string; count: number } | null;
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirm>(null);

  const instanceCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of entities) map.set(e.text, (map.get(e.text) ?? 0) + 1);
    return map;
  }, [entities]);

  useEffect(() => {
    if (!onEntityDeleteOne) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'delete') return;
      if (!selectedEntityId) return;

      const entity = entities.find(en => en.id === selectedEntityId);

      if (!entity) return;

      e.preventDefault();
      setDeleteConfirm({ entityId: entity.id, entityText: entity.text, count: instanceCounts.get(entity.text) ?? 1 });
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [selectedEntityId, entities, instanceCounts, onEntityDeleteOne]);

  const pageContent = extractedText[currentPage - 1] ?? extractedText[0];
  const pageEntities = entities.filter(e => e.page === currentPage).sort((a, b) => a.start - b.start);

  const { dragState, dragStateRef, startDrag } = useEntityDrag(
    pageEntities,
    pageContent.text,
    containerRef,
    onEntityUpdate,
  );

  const { selection, handleMouseUp, handleAddEntity, dismissSelection } = useTextSelection(
    containerRef,
    extractedText,
    entities,
    pageEntities,
    currentPage,
    selectedEntityId,
    addEntity,
    onEntityClick,
  );

  const {
    searchOpen, setSearchOpen,
    searchQuery, setSearchQuery,
    debouncedQuery,
    searchMatches, searchMatchIndex,
    searchInputRef,
    navigateMatch, closeSearch,
  } = useDocumentSearch(extractedText, containerRef, onPageChange);

  // During drag, override the dragged entity's bounds for real-time preview
  const displayEntities = dragState
    ? pageEntities.map(e =>
        e.id === dragState.entityId
          ? { ...e, start: dragState.previewStart, end: dragState.previewEnd, text: pageContent.text.slice(dragState.previewStart, dragState.previewEnd) }
          : e
      )
    : pageEntities;

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

  const isEmptyPage = pageContent.text.trim().length < 15;

  const textParts = useMemo(() => createTextParts({
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
    onDeleteOne: onEntityDeleteOne,
    onDeleteAll: onEntityDeleteAll,
    instanceCounts,
  }), [
    modelName, pageContent.text, displayEntities, selectedEntityId, highlightedEntityText,
    onEntityClick, selection, currentPagePreviewMatches, startDrag, dragState,
    focusedMatchStart, searchMatches.length, onEntityDeleteOne, onEntityDeleteAll, instanceCounts,
  ]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
      <DocumentSearchBar
        open={searchOpen}
        query={searchQuery}
        debouncedQuery={debouncedQuery}
        matches={searchMatches}
        matchIndex={searchMatchIndex}
        inputRef={searchInputRef}
        isSidebarCollapsed={isSidebarCollapsed}
        onOpen={() => setSearchOpen(true)}
        onQueryChange={setSearchQuery}
        onNavigate={navigateMatch}
        onKeyDown={e => {
          if (e.key === 'Escape') closeSearch();
          if (e.key === 'Enter') navigateMatch(e.shiftKey ? 'prev' : 'next');
        }}
        onClose={closeSearch}
      />

      <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 relative flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto bg-surface-subtle flex justify-center py-16 px-4">
        <div
          className="bg-white dark:bg-[#2a2a36] rounded-lg w-full max-w-2xl min-h-210.5 p-12 relative self-start"
          style={{
            boxShadow: '0 2px 8px rgb(0 0 0 / 0.07)',
            zoom: zoom / 100,
          }}
        >
          <div className="absolute top-3 right-4 text-xs text-gray-400 tabular-nums">
            {t('pdf.page', { page: currentPage })}
          </div>

          <div
            ref={setContainerRef}
            onMouseUp={() => handleMouseUp(!!dragStateRef.current)}
            className={cn(
              'font-mono text-[13px] leading-[1.9] text-gray-800 dark:text-gray-200 whitespace-pre-wrap select-text',
              dragState && 'select-none cursor-ew-resize',
              isEmptyPage && 'flex items-center justify-center min-h-[70vh]',
            )}
          >
            {isEmptyPage ? <EmptyPDFPage /> : textParts}
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
      </div>

      <button
        onClick={() => setFeedbackOpen(true)}
        className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-fg-muted hover:text-fg bg-card border border-border-theme hover:border-border-strong shadow-sm transition-all duration-200 cursor-pointer"
      >
        <MessageSquarePlus size={13} />
        <span>{t('feedback.title')}</span>
      </button>

      <DeleteEntityDialog
        open={!!deleteConfirm}
        onOpenChange={open => !open && setDeleteConfirm(null)}
        entityText={deleteConfirm?.entityText ?? ''}
        instanceCount={deleteConfirm?.count ?? 1}
        onDeleteOne={() => { onEntityDeleteOne?.(deleteConfirm!.entityId); setDeleteConfirm(null); }}
        onDeleteAll={() => { onEntityDeleteAll?.(deleteConfirm!.entityText); setDeleteConfirm(null); }}
      />
    </div>
  );
});
