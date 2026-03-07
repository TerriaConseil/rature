import { X, Tag, Layers, Plus } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button.tsx';
import { cn } from '@/lib/utils.ts';

interface SelectionPopoverProps {
  selectedText: string;
  position: { x: number; y: number };
  matchCount: number;
  onCreate: () => void;
  onCreateAll: () => void;
  onDismiss: () => void;
}

export function SelectionPopover({
  selectedText,
  position,
  matchCount,
  onCreate,
  onCreateAll,
  onDismiss,
}: SelectionPopoverProps) {
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  const hasMultipleMatches = matchCount > 1;
  const POPOVER_APPROX_HEIGHT = hasMultipleMatches ? 290 : 240;
  const isAbove = window.innerHeight - position.y < POPOVER_APPROX_HEIGHT + 16;

  const truncatedText =
    selectedText.length > 34 ? selectedText.slice(0, 34) + '…' : selectedText;

  useEffect(() => {
    const timer = setTimeout(() => firstButtonRef.current?.focus(), 60);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onDismiss]);

  return (
    /* Outer div handles positioning only; inner div handles animation */
    <div
      style={{
        position: 'fixed',
        left: position.x,
        transform: 'translateX(-50%)',
        ...(isAbove
          ? { bottom: window.innerHeight - position.y + 10 }
          : { top: position.y + 10 }),
        zIndex: 9999,
        minWidth: 260,
        maxWidth: 320,
        width: 'max-content',
      }}
    >
      <div
        className={cn(
          'bg-card border border-border-theme rounded-xl shadow-2xl overflow-hidden',
          'animate-in fade-in zoom-in-95 duration-150 ease-out',
          isAbove ? 'origin-bottom' : 'origin-top',
        )}
      >
        <div className="h-0.75 bg-accent w-full" />

        <div className="flex items-center justify-between px-3 pt-2.5 pb-2">
          <div className="flex items-center gap-1.5">
            <Tag size={11} className="text-accent" strokeWidth={2.5} />
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-fg-muted">
              Ajouter comme entité
            </span>
          </div>
          <button
            onClick={onDismiss}
            className="w-5 h-5 flex items-center justify-center rounded-md text-fg-subtle hover:text-fg hover:bg-surface-subtle transition-all duration-100 cursor-pointer"
            aria-label="Fermer"
          >
            <X size={11} strokeWidth={2.5} />
          </button>
        </div>

        <div className="px-3 pb-2.5">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-surface-subtle border border-border-theme">
            <span className="w-1.5 h-1.5 rounded-full bg-accent/70 shrink-0" />
            <span className="text-[11.5px] italic font-mono text-fg leading-tight truncate">
              &ldquo;{truncatedText}&rdquo;
            </span>
          </div>
        </div>

        {hasMultipleMatches && (
          <div className="px-3 pb-2.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-accent/8 border border-accent/20 dark:bg-accent/10">
              <Layers size={10} className="text-accent shrink-0" strokeWidth={2.5} />
              <span className="text-[11px] font-medium text-accent leading-tight">
                {matchCount} occurrence{matchCount > 1 ? 's' : ''} trouvée{matchCount > 1 ? 's' : ''} dans le document
              </span>
            </div>
          </div>
        )}

        <div className="h-px bg-border-theme mx-0 mb-2.5" />

        <div className="px-3 pb-3 flex flex-col gap-1.5">
          {hasMultipleMatches ? (
            <>
              <Button ref={firstButtonRef} size="md" onClick={onCreateAll} className="w-full justify-center gap-1.5">
                <Layers size={13} strokeWidth={2.5} />
                Ajouter tout ({matchCount})
              </Button>
              <Button size="md" variant="secondary" onClick={onCreate} className="w-full justify-center gap-1.5">
                <Plus size={13} strokeWidth={2.5} />
                Ajouter uniquement celui-ci
              </Button>
            </>
          ) : (
            <Button ref={firstButtonRef} size="md" onClick={onCreate} className="w-full justify-center">
              Ajouter
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
