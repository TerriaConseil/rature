import { useState } from 'react';
import { Search, CheckSquare, Square, Trash2, Pencil } from 'lucide-react';
import { CUSTOM_ENTITY_TYPES, type GroupedEntity } from '@/types/index.ts';
import { cn } from '@/lib/utils.ts';
import { useAnonymization } from '@/hooks/useAnonymization.ts';
import { NER_MODELS } from '@/models/utils.ts';

interface DetectionSidebarProps {
  entities: GroupedEntity[];
  selectedEntityId: string | null;
  currentPage: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onEntitySelect: (id: string) => void;
}

export function DetectionSidebar({
  entities,
  selectedEntityId,
  currentPage,
  onToggle,
  onDelete,
  onSelectAll,
  onDeselectAll,
  onEntitySelect,
}: DetectionSidebarProps) {
  const { modelName, modelTokens } = useAnonymization();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string | 'all'>('all');

  const includedCount = entities.filter(e => e.included).length;
  const totalPages = Math.max(...entities.map(e => e.page));

  const filtered = entities.filter(e => {
    const matchSearch = e.text.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || e.type === filterType;

    return matchSearch && matchType;
  });

  const allTypes = [
    ...modelTokens,
    ...CUSTOM_ENTITY_TYPES.map((type) => type.replace('R-', '')),
  ];

  console.log(modelTokens, allTypes, new Set(entities.map((ent) => ent.type)));
  const grouped = allTypes.reduce<Record<string, GroupedEntity[]>>(
    (acc, type) => {
      acc[type] = filtered.filter(e => e.type === type);
      return acc;
    },
    {}
  );

  return (
    <aside className="w-90 shrink-0 border-l border-border-theme bg-card flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-border-theme shrink-0">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-semibold text-fg">Entités détectées</h2>
          <span className="text-xs text-fg-muted bg-surface-subtle rounded-full px-2 py-0.5">
            {entities.length} entités · {totalPages} pages
          </span>
        </div>
        <p className="text-xs text-fg-subtle">
          {includedCount} sélectionnée{includedCount !== 1 ? 's' : ''} pour occultation
        </p>
      </div>

      <div className="px-4 py-3 space-y-2 border-b border-border-theme shrink-0">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher..."
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
            Tous
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
            Tout sélectionner
          </button>
          <span className="text-fg-subtle">·</span>
          <button
            onClick={onDeselectAll}
            className="text-xs text-fg-muted hover:text-fg transition-colors cursor-pointer"
          >
            Tout désélectionner
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {allTypes.map(type => {
          const group = grouped[type];

          if (group.length === 0) return null;

          const meta = NER_MODELS[modelName].entities[type];

          return (
            <div key={type} className="mb-1">
              <div className="flex items-center gap-2 px-4 py-1.5">
                <span className={cn('w-2 h-2 rounded-full', meta.dot)} />
                <span className="text-xs font-medium text-fg-muted uppercase tracking-wider">
                  {meta.label}s
                </span>
                <span className="text-xs text-fg-subtle">({group.length})</span>
              </div>

              {group.map(entity => {
                const isSelected = selectedEntityId === entity.id;
                const isCurrentPage = entity.page === currentPage;

                return (
                  <div
                    key={entity.id}
                    onClick={() => onEntitySelect(entity.id)}
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
                        onToggle(entity.id);
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
                      <p className="text-xs text-fg-subtle">
                        Page {entity.page}
                        {isCurrentPage && (
                          <span className="ml-1.5 text-accent font-medium">· page actuelle</span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={e => e.stopPropagation()}
                        className="w-6 h-6 flex items-center justify-center rounded-[5px] text-fg-subtle hover:text-fg hover:bg-border-theme transition-all cursor-pointer"
                        title="Modifier"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); onDelete(entity.id); }}
                        className="w-6 h-6 flex items-center justify-center rounded-[5px] text-fg-subtle hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-fg-muted">Aucune entité trouvée</p>
            <button
              onClick={() => { setSearch(''); setFilterType('all'); }}
              className="mt-2 text-xs text-accent hover:underline cursor-pointer"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-border-theme shrink-0">
        <p className="text-xs font-medium text-fg-muted mb-2">Légende</p>
        <div className="grid grid-cols-2 gap-y-1.5 gap-x-3">
          {allTypes.map(type => {
            const meta = NER_MODELS[modelName].entities[type];

            return (
              <div key={type} className="flex items-center gap-1.5">
                <span className={cn('w-2 h-2 rounded-full shrink-0', meta.dot)} />
                <span className="text-xs text-fg-muted">{meta.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
