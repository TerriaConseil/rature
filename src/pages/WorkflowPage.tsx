import { useState } from 'react';
import { Toolbar } from '@/components/workflow/Toolbar.tsx';
import { PDFViewer } from '@/components/workflow/PDFViewer.tsx';
import { DetectionSidebar } from '@/components/workflow/DetectionSidebar.tsx';
import { ExportModal } from '@/components/workflow/ExportModal.tsx';
import { MOCK_ENTITIES } from '@/data/mockEntities.ts';
import type { DetectedEntity } from '@/types/index.ts';
import { useAnonymization } from '@/hooks/useAnonymization.ts';
import { usePdfProcessing } from '@/hooks/usePdfProcessing.ts';

interface WorkflowPageProps {
  onBack: () => void;
};

const TOTAL_PAGES = 3;

export function WorkflowPage({ onBack }: WorkflowPageProps) {
  const { reset: resetEntities } = useAnonymization();
  const { file, reset: resetPdfDocument } = usePdfProcessing();
  const [entities, setEntities] = useState<DetectedEntity[]>(MOCK_ENTITIES);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);

  const toggleEntity = (id: string) => {
    setEntities(prev =>
      prev.map(e => (e.id === id ? { ...e, included: !e.included } : e)),
    );
  };

  const deleteEntity = (id: string) => {
    setEntities(prev => prev.filter(e => e.id !== id));
    if (selectedEntityId === id) setSelectedEntityId(null);
  };

  const selectAll = () => setEntities(prev => prev.map(e => ({ ...e, included: true })));
  const deselectAll = () => setEntities(prev => prev.map(e => ({ ...e, included: false })));

  const handleEntitySelect = (id: string) => {
    setSelectedEntityId(prev => (prev === id ? null : id));
    const entity = entities.find(e => e.id === id);
    if (entity && entity.page !== currentPage) {
      setCurrentPage(entity.page);
    }
  };

  const handleZoomIn = () => setZoom(z => Math.min(z + 25, 200));
  const handleZoomOut = () => setZoom(z => Math.max(z - 25, 50));

  const handleBackClick = () => {
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
        totalPages={TOTAL_PAGES}
        zoom={zoom}
        onBack={handleBackClick}
        onPrevPage={() => setCurrentPage(p => Math.max(p - 1, 1))}
        onNextPage={() => setCurrentPage(p => Math.min(p + 1, TOTAL_PAGES))}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onRescan={() => {
          setEntities(MOCK_ENTITIES);
          setSelectedEntityId(null);
        }}
        onExport={() => setShowExport(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        <PDFViewer
          currentPage={currentPage}
          entities={entities}
          selectedEntityId={selectedEntityId}
          onEntityClick={handleEntitySelect}
        />
        <DetectionSidebar
          entities={entities}
          selectedEntityId={selectedEntityId}
          currentPage={currentPage}
          onToggle={toggleEntity}
          onDelete={deleteEntity}
          onSelectAll={selectAll}
          onDeselectAll={deselectAll}
          onEntitySelect={handleEntitySelect}
        />
      </div>

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
