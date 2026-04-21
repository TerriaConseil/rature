import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import { ActionsIsland } from '@/components/workflow/ActionsIsland.tsx';
import { DetectionSidebar } from '@/components/workflow/DetectionSidebar.tsx';
import { PDFViewer } from '@/components/workflow/PDFViewer.tsx';
import { useAnonymization } from '@/hooks/useAnonymization.ts';
import { useDocument } from '@/hooks/useDocument.ts';
import { usePdfProcessing } from '@/hooks/usePdfProcessing.ts';
import { tryApplyExpansionDelta } from '@/lib/entity-expansion.ts';
import type { GroupedEntity } from '@/types/index.ts';

export function EditionPage() {
  const { currentPage, setCurrentPage, zoom, handleModeChange } = useDocument();
  const { nerEntities: entities, setNerEntities: setEntities } = useAnonymization();
  const { extractedText } = usePdfProcessing();
  const { t } = useTranslation();
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [highlightedEntityText, setHighlightedEntityText] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => { setIsCollapsed(false); }, []);

  const entitiesRef = useRef(entities);
  const currentPageRef = useRef(currentPage);

  // eslint-disable-next-line react-hooks/refs
  entitiesRef.current = entities;
  // eslint-disable-next-line react-hooks/refs
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

  const handleEntityUpdateAll = useCallback(
    (entityId: string, originalText: string, updates: Partial<GroupedEntity>) => {
      const entity = entitiesRef.current.find(e => e.id === entityId);
      if (!entity || updates.start == null || updates.end == null) return;

      const deltaStart = entity.start - updates.start;
      const deltaEnd = updates.end - entity.end;

      // updatedCount starts at 1 — the dragged entity itself is always applied
      let updatedCount = 1;
      let skippedCount = 0;

      const newEntities: GroupedEntity[] = [];
      for (const e of entitiesRef.current) {
        if (e.id === entityId) {
          newEntities.push({ ...e, ...updates });
          continue;
        }
        if (e.text !== originalText) {
          newEntities.push(e);
          continue;
        }

        const pageText = extractedText[e.page - 1]?.text ?? '';
        // Pass newEntities (already-updated siblings) so overlap detection sees
        // the latest positions, not the stale pre-mutation snapshot.
        const result = tryApplyExpansionDelta(e, deltaStart, deltaEnd, pageText, newEntities);
        if (result) {
          updatedCount++;
          newEntities.push({ ...e, ...result });
        } else {
          skippedCount++;
          newEntities.push(e);
        }
      }

      setEntities(newEntities);

      if (skippedCount === 0) {
        toast.success(t('edit.updatedAll', { count: updatedCount }));
      } else {
        toast.info(t('edit.updatedPartial', { updated: updatedCount, total: updatedCount + skippedCount }));
      }
    },
    [setEntities, extractedText, t],
  );

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
    <div className="flex h-full overflow-hidden relative">
      <PDFViewer
        currentPage={currentPage}
        zoom={zoom}
        entities={entities}
        selectedEntityId={selectedEntityId}
        highlightedEntityText={highlightedEntityText}
        isSidebarCollapsed={isCollapsed}
        onEntityClick={handleEntitySelect}
        onEntityUpdate={handleEntityUpdate}
        onEntityUpdateAll={handleEntityUpdateAll}
        onPageChange={setCurrentPage}
        onEntityDeleteOne={deleteEntityById}
        onEntityDeleteAll={deleteEntity}
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
        isCollapsed={isCollapsed}
        onCollapseToggle={() => setIsCollapsed(c => !c)}
      />
      <ActionsIsland mode="edition" onModeChange={handleModeChange} />
    </div>
  );
}
