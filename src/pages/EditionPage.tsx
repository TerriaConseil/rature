import { useState, useCallback, useRef } from 'react';

import { DetectionSidebar } from '@/components/workflow/DetectionSidebar.tsx';
import { PDFViewer } from '@/components/workflow/PDFViewer.tsx';
import { useAnonymization } from '@/hooks/useAnonymization.ts';
import { useDocument } from '@/hooks/useDocument.ts';
import type { GroupedEntity } from '@/types/index.ts';

export function EditionPage() {
  const { currentPage, setCurrentPage, zoom, handleModeChange } = useDocument();
  const { nerEntities: entities, setNerEntities: setEntities } = useAnonymization();
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [highlightedEntityText, setHighlightedEntityText] = useState<string | null>(null);

  const entitiesRef = useRef(entities);
  const currentPageRef = useRef(currentPage);

  entitiesRef.current = entities;
  currentPageRef.current = currentPage;

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

  const selectAll = useCallback(() => {
    setEntities(entitiesRef.current.map(e => ({ ...e, included: true })));
  }, [setEntities]);

  const deselectAll = useCallback(() => {
    setEntities(entitiesRef.current.map(e => ({ ...e, included: false })));
  }, [setEntities]);

  const handleEntitySelect = useCallback((id: string) => {
    setSelectedEntityId(prev => prev === id ? null : id);
    const entity = entitiesRef.current.find(e => e.id === id);
    if (entity && entity.page !== currentPageRef.current) {
      setCurrentPage(entity.page);
    }
  }, [setCurrentPage]);

  return (
    <div className="flex h-full overflow-hidden">
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
        mode="edition"
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
  );
}
