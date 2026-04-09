import { useState, useCallback, useRef } from 'react';
import { type PDFDocument } from 'mupdf';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useParams } from 'react-router';

import { ActionsIsland } from '@/components/workflow/ActionsIsland.tsx';
import { Toolbar } from '@/components/workflow/Toolbar.tsx';
import { PDFViewer } from '@/components/workflow/PDFViewer.tsx';
import { PDFPageRenderer } from '@/components/workflow/PDFPageRenderer.tsx';
import { PageThumbnailPanel } from '@/components/workflow/PageThumbnailPanel.tsx';
import { DetectionSidebar } from '@/components/workflow/DetectionSidebar.tsx';
import { ExportModal } from '@/components/workflow/ExportModal.tsx';
import { ImageEditionPage } from '@/components/workflow/ImageEditionPage.tsx';
import { useAnonymization } from '@/hooks/useAnonymization.ts';
import { usePdfProcessing } from '@/hooks/usePdfProcessing.ts';
import { useRedactWorker } from '@/hooks/useRedactWorker.ts';
import { downloadPDFDocument } from '@/lib/pdf/exportPDF.ts';
import type { GroupedEntity, WorkflowMode } from '@/types/index.ts';

interface WorkflowPageProps {
  onBack: () => void;
};

export function WorkflowPage({ onBack }: WorkflowPageProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mode: modeParam } = useParams<{ mode: string }>();
  const mode: WorkflowMode = modeParam === 'preview' ? 'preview' : modeParam === 'image-edition' ? 'image-edition' : 'edition';
  const { nerEntities: entities, reset: resetEntities, setNerEntities: setEntities } = useAnonymization();
  const { file, pageCount, detectedImages, reset: resetPdfDocument } = usePdfProcessing();
  const { redact } = useRedactWorker();
  const [redactedDocument, setRedactedDocument] = useState<PDFDocument | null>(null);
  const [pendingPages, setPendingPages] = useState<Set<number>>(new Set());
  const [isRedacting, setIsRedacting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [highlightedEntityText, setHighlightedEntityText] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);

  // Stable refs so callbacks don't need entities/currentPage/detectedImages in their dep arrays
  const entitiesRef = useRef(entities);
  const currentPageRef = useRef(currentPage);
  const detectedImagesRef = useRef(detectedImages);

  // eslint-disable-next-line react-hooks/refs
  entitiesRef.current = entities;
  // eslint-disable-next-line react-hooks/refs
  currentPageRef.current = currentPage;
  // eslint-disable-next-line react-hooks/refs
  detectedImagesRef.current = detectedImages;

  const toggleEntity = useCallback((name: string) => {
    setEntities(entitiesRef.current.map(e => e.text === name ? { ...e, included: !e.included } : e));
  }, [setEntities]);

  const deleteEntity = useCallback((name: string) => {
    const ids = new Set(entitiesRef.current.filter(e => e.text === name).map(e => e.id));
    setEntities(entitiesRef.current.filter(e => !ids.has(e.id)));
    setSelectedEntityId(prev => prev && ids.has(prev) ? null : prev);
    setHighlightedEntityText(prev => prev === name ? null : prev);
  }, [setEntities]);

  const deleteEntityById = useCallback((id: string) => {
    setEntities(entitiesRef.current.filter(e => e.id !== id));
    setSelectedEntityId(prev => prev === id ? null : prev);
  }, [setEntities]);

  const handleHighlightAll = useCallback((text: string | null) => {
    setHighlightedEntityText(prev => prev === text ? null : text);
  }, []);

  const handleEntityUpdate = useCallback((entityId: string, updates: Partial<GroupedEntity>) => {
    setEntities(entitiesRef.current.map(e => e.id === entityId ? { ...e, ...updates } : e));
  }, [setEntities]);

  const selectAll = useCallback(() => setEntities(entitiesRef.current.map(e => ({ ...e, included: true }))), [setEntities]);
  const deselectAll = useCallback(() => setEntities(entitiesRef.current.map(e => ({ ...e, included: false }))), [setEntities]);

  const handleEntitySelect = useCallback((id: string) => {
    setSelectedEntityId(prev => prev === id ? null : id);
    const entity = entitiesRef.current.find(e => e.id === id);
    if (entity && entity.page !== currentPageRef.current) {
      setCurrentPage(entity.page);
    }
  }, []);

  const handleModeChange = useCallback(async (newMode: WorkflowMode) => {
    if (newMode === 'preview') {
      if (!file) return;
      setIsRedacting(true);
      navigate('/document/preview', { replace: true });
      setPendingPages(new Set(Array.from({ length: pageCount }, (_, i) => i)));
      try {
        const doc = await redact(
          file,
          entitiesRef.current,
          currentPageRef.current - 1,
          (partialDoc, processedPages) => {
            setRedactedDocument(partialDoc);
            setPendingPages(prev => {
              const next = new Set(prev);
              for (const p of processedPages) next.delete(p);
              return next;
            });
            setIsRedacting(false);
          },
          detectedImagesRef.current,
          'pixels',
        );
        setRedactedDocument(doc);
        setPendingPages(new Set());
      } catch (err) {
        console.error('Redaction failed:', err);
        navigate('/document/edition', { replace: true });
        setIsRedacting(false);
        setPendingPages(new Set());
      }
    } else if (newMode === 'image-edition') {
      setRedactedDocument(null);
      setPendingPages(new Set());
      navigate('/document/image-edition', { replace: true });
    } else {
      setRedactedDocument(null);
      setPendingPages(new Set());
      navigate('/document/edition', { replace: true });
    }
  }, [file, navigate, pageCount, redact]);

  const handleZoomIn = useCallback(() => setZoom(z => Math.min(z + 25, 200)), []);
  const handleZoomOut = useCallback(() => setZoom(z => Math.max(z - 25, 50)), []);

  const handleBackClick = useCallback(() => {
    const confirmationMessage = t('toolbar.confirmBack');
    if (confirm(confirmationMessage)) {
      setRedactedDocument(null);
      setPendingPages(new Set());
      resetEntities();
      resetPdfDocument();
      onBack();
    }
  }, [t, resetEntities, resetPdfDocument, onBack]);

  if (!file) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Toolbar
        fileName={file.name}
        currentPage={currentPage}
        totalPages={pageCount}
        zoom={zoom}
        mode={mode}
        onBack={handleBackClick}
        onPrevPage={() => setCurrentPage(p => Math.max(p - 1, 1))}
        onNextPage={() => setCurrentPage(p => Math.min(p + 1, pageCount))}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onExport={() => setShowExport(true)}
      />

      <div className="shrink-0 px-5 py-2.5 border-b border-border-theme bg-card flex items-baseline gap-3">
        <span className="text-sm font-semibold text-fg">
          {mode === 'edition' && t('toolbar.textEdition')}
          {mode === 'image-edition' && t('toolbar.imageEdition')}
          {mode === 'preview' && t('toolbar.preview')}
        </span>
        <span className="text-xs text-fg-muted">
          {mode === 'edition' && t('toolbar.textEditionDesc')}
          {mode === 'image-edition' && t('toolbar.imageEditionDesc')}
          {mode === 'preview' && t('toolbar.previewDesc')}
        </span>
      </div>

      {mode === 'edition' ? (
        <div className="flex flex-1 overflow-hidden">
          <PDFViewer
            currentPage={currentPage}
            zoom={zoom}
            entities={entities}
            selectedEntityId={selectedEntityId}
            highlightedEntityText={highlightedEntityText}
            onEntityClick={handleEntitySelect}
            onEntityUpdate={handleEntityUpdate}
            onPageChange={setCurrentPage}
            onEntityDeleteOne={deleteEntityById}
            onEntityDeleteAll={deleteEntity}
            mode={mode}
            onModeChange={handleModeChange}
          />
          <DetectionSidebar
            currentPage={currentPage}
            entities={entities}
            selectedEntityId={selectedEntityId}
            highlightedEntityText={highlightedEntityText}
            onToggle={toggleEntity}
            onDelete={deleteEntity}
            onSelectAll={selectAll}
            onDeselectAll={deselectAll}
            onEntitySelect={handleEntitySelect}
            onHighlightAll={handleHighlightAll}
          />
        </div>
      ) : mode === 'image-edition' ? (
        <div className="flex flex-1 overflow-hidden">
          <PageThumbnailPanel currentPage={currentPage} redactedDocument={null} pendingPages={new Set()} onPageChange={setCurrentPage} />
          <div className="flex-1 relative flex flex-col overflow-hidden">
            <ImageEditionPage />
            <ActionsIsland mode={mode} onModeChange={handleModeChange} />
          </div>
        </div>
      ) : isRedacting ? (
        <div className="flex-1 overflow-auto bg-[#e8e8ec] dark:bg-[#0e0e14] flex items-center justify-center">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-fg-muted animate-pulse" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-fg-muted animate-pulse" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-fg-muted animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <PageThumbnailPanel currentPage={currentPage} redactedDocument={redactedDocument} pendingPages={pendingPages} onPageChange={setCurrentPage} />
          <div className="flex-1 relative flex flex-col overflow-hidden">
            {pendingPages.size > 0 && (
              <div className="absolute top-0 left-0 right-0 h-0.5 z-10">
                <div className="h-full bg-accent/60 animate-pulse w-full" />
              </div>
            )}
            <PDFPageRenderer pageIndex={currentPage - 1} zoom={zoom} pdfDocument={redactedDocument} />
            <ActionsIsland mode={mode} onModeChange={handleModeChange} />
          </div>
        </div>
      )}

      {showExport && (
        <ExportModal
          entities={entities}
          fileName={file.name}
          onClose={() => setShowExport(false)}
          onDownload={async ({ removeMetadata, exportFileName }) => {
            let doc = redactedDocument;
            if (!doc && file) {
              doc = await redact(file, entities, 0, () => {}, detectedImages, 'pixels');
            }
            if (!doc || !file) return;
            downloadPDFDocument(doc, exportFileName, removeMetadata);
          }}
        />
      )}
    </div>
  );
}
