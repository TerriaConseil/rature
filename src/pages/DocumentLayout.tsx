// src/pages/DocumentLayout.tsx
import { useCallback } from 'react';
import { Navigate, Outlet, useMatch, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { ExportModal } from '@/components/workflow/ExportModal.tsx';
import { PageThumbnailPanel } from '@/components/workflow/PageThumbnailPanel.tsx';
import { Toolbar } from '@/components/workflow/Toolbar.tsx';
import { useAnonymization } from '@/hooks/useAnonymization.ts';
import { useDocument } from '@/hooks/useDocument.ts';
import { usePdfProcessing } from '@/hooks/usePdfProcessing.ts';
import { downloadPDFDocument } from '@/lib/pdf/exportPDF.ts';
import { DocumentProvider } from '@/providers/DocumentProvider.tsx';
import type { WorkflowMode } from '@/types/index.ts';

function DocumentLayoutInner() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { nerEntities: entities, reset: resetEntities } = useAnonymization();
  const { file, pageCount, detectedImages, reset: resetPdfDocument } = usePdfProcessing();
  const {
    currentPage,
    setCurrentPage,
    zoom,
    setZoom,
    showExport,
    setShowExport,
    redactedDocument,
    imageMethod,
    setImageMethod,
    redact,
    reset,
  } = useDocument();

  const isPreview = useMatch('/document/preview');
  const isImageEdition = useMatch('/document/image-edition');
  const mode: WorkflowMode = isPreview ? 'preview' : isImageEdition ? 'image-edition' : 'edition';

  const handleZoomIn = useCallback(() => setZoom(z => Math.min(z + 25, 200)), [setZoom]);
  const handleZoomOut = useCallback(() => setZoom(z => Math.max(z - 25, 50)), [setZoom]);

  const handleBackClick = useCallback(() => {
    if (confirm(t('toolbar.confirmBack'))) {
      reset();
      resetEntities();
      resetPdfDocument();
      navigate('/');
    }
  }, [t, reset, resetEntities, resetPdfDocument, navigate]);

  if (!file) return <Navigate to="/" />;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Toolbar
        fileName={file.name}
        currentPage={currentPage}
        totalPages={pageCount}
        zoom={zoom}
        onBack={handleBackClick}
        onPrevPage={() => setCurrentPage(p => Math.max(p - 1, 1))}
        onNextPage={() => setCurrentPage(p => Math.min(p + 1, pageCount))}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onExport={() => setShowExport(true)}
      />

      <div className="h-10.5 shrink-0 px-5 py-2.5 border-b border-border-theme bg-card flex items-baseline gap-3">
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

      <div className="flex flex-1 overflow-hidden">
        <PageThumbnailPanel
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
        <div className="flex-1 relative overflow-hidden">
          <Outlet />
        </div>
      </div>

      {showExport && (
        <ExportModal
          entities={entities}
          fileName={file.name}
          includedImageCount={detectedImages.filter(img => img.included).length}
          imageMethod={imageMethod}
          onImageMethodChange={setImageMethod}
          onClose={() => setShowExport(false)}
          onDownload={async ({ removeMetadata, exportFileName }) => {
            try {
              let doc = redactedDocument;
              if (!doc && file) {
                doc = await redact(file, entities, 0, () => {}, detectedImages, imageMethod);
              }
              if (!doc || !file) return;
              downloadPDFDocument(doc, exportFileName, removeMetadata);
            } catch (err) {
              console.error('Export failed:', err);
              toast.error(t('export.error'));
            }
          }}
        />
      )}
    </div>
  );
}

export function DocumentLayout() {
  return (
    <DocumentProvider>
      <DocumentLayoutInner />
    </DocumentProvider>
  );
}
