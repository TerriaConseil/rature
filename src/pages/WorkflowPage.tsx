import { useState } from 'react';
import { type PDFDocument } from 'mupdf';
import { Toolbar } from '@/components/workflow/Toolbar.tsx';
import { PDFViewer } from '@/components/workflow/PDFViewer.tsx';
import { PDFPageRenderer } from '@/components/workflow/PDFPageRenderer.tsx';
import { DetectionSidebar } from '@/components/workflow/DetectionSidebar.tsx';
import { ExportModal } from '@/components/workflow/ExportModal.tsx';
import { useAnonymization } from '@/hooks/useAnonymization.ts';
import { usePdfProcessing } from '@/hooks/usePdfProcessing.ts';
import { redactPDFDocument } from '@/lib/pdf/redactPDF.ts';
import type { WorkflowMode } from '@/types/index.ts';

interface WorkflowPageProps {
  onBack: () => void;
};

export function WorkflowPage({ onBack }: WorkflowPageProps) {
  const { nerEntities: entities, reset: resetEntities, setNerEntities: setEntities } = useAnonymization();
  const { file, pageCount, reset: resetPdfDocument } = usePdfProcessing();
  const [mode, setMode] = useState<WorkflowMode>('edition');
  const [redactedDocument, setRedactedDocument] = useState<PDFDocument | null>(null);
  const [isRedacting, setIsRedacting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);

  const toggleEntity = (name: string) => {
    setEntities(entities.map(e => (e.text === name ? { ...e, included: !e.included } : e)),
    );
  };

  const deleteEntity = (name: string) => {
    const matchingEntities = entities.filter(e => e.text === name);
    const ids = matchingEntities.map((e) => e.id);

    setEntities(entities.filter(e => !ids.includes(e.id)));

    if (selectedEntityId && ids.includes(selectedEntityId)) setSelectedEntityId(null);
  };

  const selectAll = () => setEntities(entities.map(e => ({ ...e, included: true })));
  const deselectAll = () => setEntities(entities.map(e => ({ ...e, included: false })));

  const handleEntitySelect = (id: string) => {
    setSelectedEntityId(prev => (prev === id ? null : id));
    const entity = entities.find(e => e.id === id);

    if (entity && entity.page !== currentPage) {
      setCurrentPage(entity.page);
    }
  };

  const handleModeChange = async (newMode: WorkflowMode) => {
    if (newMode === 'preview') {
      if (!file) return;
      setIsRedacting(true);
      setMode('preview');
      try {
        const doc = await redactPDFDocument(file, entities);
        setRedactedDocument(doc);
      } catch (err) {
        console.error('Redaction failed:', err);
        setMode('edition');
      } finally {
        setIsRedacting(false);
      }
    } else {
      setRedactedDocument(null);
      setMode('edition');
    }
  };

  const handleZoomIn = () => setZoom(z => Math.min(z + 25, 200));
  const handleZoomOut = () => setZoom(z => Math.max(z - 25, 50));

  const handleBackClick = () => {
    setRedactedDocument(null);
    resetEntities();
    resetPdfDocument();
    onBack();
  };

  if (!file) {
    return <div>No file selected!</div>;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Toolbar
        fileName={file.name}
        currentPage={currentPage}
        totalPages={pageCount}
        zoom={zoom}
        mode={mode}
        onModeChange={handleModeChange}
        onBack={handleBackClick}
        onPrevPage={() => setCurrentPage(p => Math.max(p - 1, 1))}
        onNextPage={() => setCurrentPage(p => Math.min(p + 1, pageCount))}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onRescan={() => {
          setSelectedEntityId(null);
        }}
        onExport={() => setShowExport(true)}
      />

      {mode === 'edition' ? (
        <div className="flex flex-1 overflow-hidden">
          <PDFViewer
            currentPage={currentPage}
            zoom={zoom}
            entities={entities}
            selectedEntityId={selectedEntityId}
            onEntityClick={handleEntitySelect}
          />
          <DetectionSidebar
            currentPage={currentPage}
            entities={entities}
            selectedEntityId={selectedEntityId}
            onToggle={toggleEntity}
            onDelete={deleteEntity}
            onSelectAll={selectAll}
            onDeselectAll={deselectAll}
            onEntitySelect={handleEntitySelect}
          />
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
        <PDFPageRenderer pageIndex={currentPage - 1} zoom={zoom} pdfDocument={redactedDocument} />
      )}

      {showExport && (
        <ExportModal
          entities={entities}
          fileName={file.name}
          onClose={() => setShowExport(false)}
          onDownload={() => {
            // Real export will be wired later
          }}
        />
      )}
    </div>
  );
}
