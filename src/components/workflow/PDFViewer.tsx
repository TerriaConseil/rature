import { useState } from 'react';
import { ScanLine, MessageSquarePlus } from 'lucide-react';

import { DocumentSearchBar } from '@/components/workflow/DocumentSearchBar.tsx';
import { FeedbackModal } from '@/components/workflow/FeedbackModal.tsx';
import { PageThumbnailPanel } from '@/components/workflow/PageThumbnailPanel.tsx';
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
  const { extractedText, pageCount } = usePdfProcessing();
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

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
      {pageCount > 1 && (
        <PageThumbnailPanel currentPage={currentPage} entities={entities} onPageChange={onPageChange} />
      )}
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
            onMouseUp={() => handleMouseUp(!!dragStateRef.current)}
            className={cn(
              'font-mono text-[13px] leading-[1.9] text-gray-800 dark:text-gray-200 whitespace-pre-wrap select-text',
              dragState && 'select-none cursor-ew-resize',
              isEmptyPage && 'flex items-center justify-center min-h-[70vh]',
            )}
          >
            {isEmptyPage ? (
              <div className="flex flex-col items-center justify-center text-center max-w-xs gap-5 select-none">
                <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                  <ScanLine
                    size={28}
                    strokeWidth={1.5}
                    className="text-gray-400 dark:text-gray-500"
                  />
                  <span className="absolute -bottom-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-teal-500/15 ring-2 ring-white dark:ring-[#2a2a36]">
                    <span className="block h-1.5 w-1.5 rounded-full bg-teal-500" />
                  </span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400 tracking-wide">
                    Page non traitée
                  </p>
                  <p className="text-[12px] leading-relaxed text-fg-muted max-w-55">
                    Cette page semble être une image scannée. La reconnaissance optique de caractères (OCR) sera disponible prochainement.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 rounded-full border border-teal-200 dark:border-teal-800/60 bg-teal-50 dark:bg-teal-950/30 px-3 py-2 text-sm font-medium text-teal-600 dark:text-teal-400 tracking-wide">
                  <p className="flex items-center justify-center h-4 w-4">
                    <span className="block h-1.5 w-1.5 rounded-full bg-teal-500" />
                  </p>
                  <span>Bientôt disponible</span>
                </div>
              </div>
            ) : textParts}
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

      <button
        onClick={() => setFeedbackOpen(true)}
        className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-fg-muted hover:text-fg bg-card border border-border-theme hover:border-border-strong shadow-sm transition-all duration-200 cursor-pointer"
      >
        <MessageSquarePlus size={13} />
        <span>Feedback</span>
      </button>
    </div>
  );
}
