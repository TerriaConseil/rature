import { useState, useEffect, useRef } from 'react';
import { Search, CheckSquare, Square, Trash2, ChevronRight, ChevronLeft, ScanEye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CUSTOM_ENTITY_TYPES, type GroupedEntity } from '@/types/index.ts';
import { cn } from '@/lib/utils.ts';
import { useAnonymization } from '@/hooks/useAnonymization.ts';
import { NER_MODELS } from '@/models/utils.ts';
import { usePdfProcessing } from '@/hooks/usePdfProcessing.ts';

type GroupedByNameEntity = {
  text: string;
  type: string;
  included: boolean;
  instances: {
    id: string;
    page: number;
    score: number;
    start: number;
    end: number;
  }[];
};

const groupByName = (entities: GroupedEntity[]) => {
  const groupedByNameEntities: GroupedByNameEntity[] = [];
  const labeledEntities = entities.filter((entity) => entity.type !== 'O');

  for (const entity of labeledEntities) {
    const { id, page, score, start, end } = entity;
    const grouped = groupedByNameEntities.find((e) => e.text === entity.text);

    if (grouped) {
      grouped.instances.push({ id, page, score, start, end });
    } else {
      groupedByNameEntities.push({
        text: entity.text,
        type: entity.type,
        included: entity.included,
        instances: [{
          id: entity.id,
          page,
          score,
          start,
          end,
        }],
      });
    }
  }

  for (const group of groupedByNameEntities) {
    group.instances.sort((a, b) => a.page !== b.page ? a.page - b.page : a.start - b.start);
  }

  return groupedByNameEntities;
};

interface DetectionSidebarProps {
  currentPage: number;
  entities: GroupedEntity[];
  selectedEntityId: string | null;
  highlightedEntityText: string | null;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onEntitySelect: (id: string) => void;
  onHighlightAll: (text: string | null) => void;
}

export function DetectionSidebar({
  entities,
  selectedEntityId,
  highlightedEntityText,
  onToggle,
  onDelete,
  onSelectAll,
  onDeselectAll,
  onEntitySelect,
  onHighlightAll,
}: DetectionSidebarProps) {
  const { t } = useTranslation();
  const { modelName, modelTokens } = useAnonymization();
  const { pageCount } = usePdfProcessing();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string | 'all'>('all');
  const [collapsedTypes, setCollapsedTypes] = useState<Set<string>>(new Set());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const toggleCollapse = (type: string) => {
    setCollapsedTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  useEffect(() => {
    if (!selectedEntityId || !scrollContainerRef.current) return;
    const selectedEl = scrollContainerRef.current.querySelector('[data-selected="true"]');
    selectedEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selectedEntityId]);

  const includedCount = entities.filter(e => e.included).length;

  const filtered = entities.filter(e => {
    const matchSearch = e.text.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || e.type === filterType;

    return matchSearch && matchType;
  });

  const allTypes = [
    'MANUAL',
    ...modelTokens,
    ...CUSTOM_ENTITY_TYPES.map((type) => type.replace('R-', '')),
  ];

  const groupedByName = groupByName(filtered);

  const groupedByType = allTypes.reduce<Record<string, GroupedByNameEntity[]>>(
    (acc, type) => {
      acc[type] = groupedByName.filter(e => e.type === type);
      return acc;
    },
    {}
  );

  const handleEntityClick = (name: string) => {
    const entity = groupedByName.find((e) => e.text === name);
    if (!entity) return;
    const instancesIds = entity.instances.map(({ id }) => id);
    if (selectedEntityId && instancesIds.includes(selectedEntityId)) return;
    onEntitySelect(entity.instances[0].id);
  };

  const handlePrevInstance = (name: string) => {
    const entity = groupedByName.find((e) => e.text === name);
    if (!entity) return;
    const currentIndex = entity.instances.findIndex(i => i.id === selectedEntityId);
    const prevIndex = currentIndex <= 0 ? entity.instances.length - 1 : currentIndex - 1;
    onEntitySelect(entity.instances[prevIndex].id);
  };

  const handleNextInstance = (name: string) => {
    const entity = groupedByName.find((e) => e.text === name);
    if (!entity) return;
    const currentIndex = entity.instances.findIndex(i => i.id === selectedEntityId);
    const nextIndex = currentIndex >= entity.instances.length - 1 ? 0 : currentIndex + 1;
    onEntitySelect(entity.instances[nextIndex].id);
  };

  return (
    <aside className="w-90 shrink-0 border-l border-border-theme bg-card flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-border-theme shrink-0">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-semibold text-fg">{t('sidebar.title')}</h2>
          <span className="text-xs text-fg-muted bg-surface-subtle rounded-full px-2 py-0.5">
            {t('sidebar.entityCount', { count: entities.length })} · {t('sidebar.pageCount', { count: pageCount })}
          </span>
        </div>
        <p className="text-xs text-fg-subtle">
          {t('sidebar.selected', { count: includedCount })}
        </p>
      </div>

      <div className="px-4 py-3 space-y-2 border-b border-border-theme shrink-0">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle pointer-events-none" />
          <input
            type="text"
            placeholder={t('sidebar.search')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-border-theme bg-surface text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilterType('all')}
            className={cn(
              'rounded-full px-2.5 py-0.5 text-xs font-medium transition-all cursor-pointer',
              filterType === 'all'
                ? 'bg-accent text-accent-foreground'
                : 'bg-surface-subtle text-fg-muted hover:bg-border-theme',
            )}
          >
            {t('sidebar.filterAll')}
          </button>
          {allTypes.map(type => {
            const meta = NER_MODELS[modelName].entities[type];
            const count = entities.filter(e => e.type === type).length;

            if (count === 0) return null;

            return (
              <button
                key={type}
                onClick={() => setFilterType(filterType === type ? 'all' : type)}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-all cursor-pointer border',
                  filterType === type
                    ? meta.badge
                    : 'bg-surface-subtle text-fg-muted border-border-theme hover:bg-border-theme',
                )}
              >
                <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', meta.dot)} />
                {meta.label}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onSelectAll}
            className="text-xs text-fg-muted hover:text-accent transition-colors cursor-pointer"
          >
            {t('sidebar.selectAll')}
          </button>
          <span className="text-fg-subtle">·</span>
          <button
            onClick={onDeselectAll}
            className="text-xs text-fg-muted hover:text-fg transition-colors cursor-pointer"
          >
            {t('sidebar.deselectAll')}
          </button>
        </div>
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto py-2">
        {allTypes.map(type => {
          const group = groupedByType[type];

          if (group.length === 0) return null;

          const meta = NER_MODELS[modelName].entities[type];

          return (
            <div key={type} className="mb-1">
              <button
                onClick={() => toggleCollapse(type)}
                className="w-full flex items-center gap-2 px-4 py-1.5 hover:bg-surface-subtle transition-colors cursor-pointer group/header"
              >
                <ChevronRight
                  size={12}
                  className={cn(
                    'text-fg-subtle shrink-0 transition-transform duration-300',
                    !collapsedTypes.has(type) && 'rotate-90',
                  )}
                />
                <span className={cn('w-2 h-2 rounded-full shrink-0', meta.dot)} />
                <span className="text-xs font-medium text-fg-muted uppercase tracking-wider">
                  {meta.title}
                </span>
                <span className="text-xs text-fg-subtle">({group.length})</span>
              </button>

              <div
                className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                style={{ gridTemplateRows: collapsedTypes.has(type) ? '0fr' : '1fr' }}
              >
                <div className="overflow-hidden">
              {group.map(entity => {
                const isSelected = !!selectedEntityId && entity.instances.map((e) => e.id).includes(selectedEntityId);
                const isHighlightedAll = highlightedEntityText === entity.text;
                const currentInstanceIndex = isSelected
                  ? entity.instances.findIndex(i => i.id === selectedEntityId)
                  : 0;

                return (
                  <div
                    key={`${entity.text}-${entity.instances[0].id}`}
                    data-selected={isSelected}
                    onClick={() => handleEntityClick(entity.text)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-all group',
                      isSelected
                        ? 'bg-teal-50 dark:bg-teal-950/20 border-l-2 border-accent'
                        : 'hover:bg-surface-subtle border-l-2 border-transparent',
                    )}
                  >
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onToggle(entity.text);
                      }}
                      className="shrink-0 text-fg-muted hover:text-accent transition-colors cursor-pointer"
                    >
                      {entity.included ? (
                        <CheckSquare size={16} className="text-accent" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'text-sm truncate',
                          entity.included ? 'text-fg' : 'text-fg-muted line-through',
                        )}
                      >
                        {entity.text}
                      </p>
                      {/* <p className="text-xs text-fg-subtle">
                        {entity.instances.length} occurrences
                      </p> */}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {entity.instances.length > 1 && !isSelected && (
                        <span className="text-xs tabular-nums font-medium text-fg-muted bg-surface-subtle border border-border-theme rounded px-1.5 py-0.5">
                          ×{entity.instances.length}
                        </span>
                      )}

                      {entity.instances.length > 1 && isSelected && (
                        <div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => onHighlightAll(isHighlightedAll ? null : entity.text)}
                            className={cn(
                              'p-1 rounded transition-colors cursor-pointer',
                              isHighlightedAll ? 'text-accent' : 'text-fg-muted hover:text-fg',
                            )}
                            title={t('sidebar.highlightAll')}
                          >
                            <ScanEye size={13} />
                          </button>
                          <button
                            onClick={() => handlePrevInstance(entity.text)}
                            className="p-1 rounded text-fg-muted hover:text-fg transition-colors cursor-pointer"
                            title={t('sidebar.prevOccurrence')}
                          >
                            <ChevronLeft size={13} />
                          </button>
                          <span className="text-xs tabular-nums text-accent font-medium min-w-7 text-center">
                            {currentInstanceIndex + 1}/{entity.instances.length}
                          </span>
                          <button
                            onClick={() => handleNextInstance(entity.text)}
                            className="p-1 rounded text-fg-muted hover:text-fg transition-colors cursor-pointer"
                            title={t('sidebar.nextOccurrence')}
                          >
                            <ChevronRight size={13} />
                          </button>
                        </div>
                      )}

                      <button
                        onClick={e => { e.stopPropagation(); onDelete(entity.text); }}
                        className={cn(
                          'w-6 h-6 flex items-center justify-center rounded-[5px] text-fg-subtle hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer',
                          !isSelected && 'opacity-0 group-hover:opacity-100 transition-opacity',
                        )}
                        title={t('sidebar.delete')}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-fg-muted">{t('sidebar.noEntities')}</p>
            <button
              onClick={() => { setSearch(''); setFilterType('all'); }}
              className="mt-2 text-xs text-accent hover:underline cursor-pointer"
            >
              {t('sidebar.resetFilters')}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
