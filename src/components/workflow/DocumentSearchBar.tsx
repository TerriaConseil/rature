import { type RefObject } from 'react';
import { Search, ChevronUp, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { cn } from '@/lib/utils.ts';
import type { EntityMatch } from '@/lib/entity-expansion.ts';

interface DocumentSearchBarProps {
  open: boolean;
  query: string;
  debouncedQuery: string;
  matches: EntityMatch[];
  matchIndex: number;
  inputRef: RefObject<HTMLInputElement | null>;
  onOpen: () => void;
  onQueryChange: (q: string) => void;
  onNavigate: (dir: 'prev' | 'next') => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onClose: () => void;
}

const isMac = typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.userAgent);

export function DocumentSearchBar({
  open,
  query,
  debouncedQuery,
  matches,
  matchIndex,
  inputRef,
  onOpen,
  onQueryChange,
  onNavigate,
  onKeyDown,
  onClose,
}: DocumentSearchBarProps) {
  return (
    <>
      <div className="absolute top-4 right-2 flex items-center justify-end px-4 h-8 bg-transparent shrink-0">
        <Button
          onClick={onOpen}
          title="Rechercher dans le document"
          variant="secondary"
          className={cn("group", open && 'hidden')}
        >
          <Search size={16} className="group-hover:text-accent transition-colors duration-300 shrink-0" />
          <p className="max-w-0 group-hover:max-w-2xl transition-all duration-200 overflow-hidden">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Rechercher dans le document</span>
          </p>
          <kbd className="ml-0.5 px-1.5 py-0.5 text-[10px] font-mono leading-none bg-white dark:bg-[#1a1a24] border border-border rounded shadow-sm text-fg-muted">
            {isMac ? '⌘F' : 'Ctrl F'}
          </kbd>
        </Button>
      </div>

      <div
        className={cn(
          'absolute top-4 right-6 z-20',
          'flex items-center gap-1.5 pl-3 pr-2 py-1.5',
          'bg-white dark:bg-[#2a2a36]',
          'border-2 border-transparent rounded-xl shadow-xl',
          'focus-within:border-accent',
          'transition-all duration-200 ease-out',
          open
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none',
        )}
      >
        <Search className="w-3.5 h-3.5 text-fg-muted shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Rechercher dans le document…"
          className="w-52 text-sm bg-transparent outline-none text-fg placeholder:text-fg-muted caret-accent"
        />
        {debouncedQuery.length >= 3 && (
          <span className="text-xs text-fg-muted tabular-nums font-mono shrink-0 min-w-14 text-right">
            {matches.length > 0
              ? `${matchIndex + 1} / ${matches.length}`
              : 'Aucun'}
          </span>
        )}
        <div className="flex items-center gap-0.5 ml-0.5">
          <button
            onClick={() => onNavigate('prev')}
            disabled={matches.length === 0}
            aria-label="Occurrence précédente"
            className="p-1 rounded-lg hover:bg-surface-subtle disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigate('next')}
            disabled={matches.length === 0}
            aria-label="Occurrence suivante"
            className="p-1 rounded-lg hover:bg-surface-subtle disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            aria-label="Fermer la recherche"
            className="p-1 rounded-lg hover:bg-surface-subtle transition-colors ml-0.5"
          >
            <X className="w-3.5 h-3.5 text-fg-muted" />
          </button>
        </div>
      </div>
    </>
  );
}
