import { useEffect, useRef } from 'react';
import { X, Tag } from 'lucide-react';
import { cn } from '@/lib/utils.ts';

interface SelectionPopoverProps {
  selectedText: string;
  position: { x: number; y: number };
  entityTypes: Record<string, { label: string; dot: string; badge: string; highlight: string }>;
  onSelectType: (type: string) => void;
  onDismiss: () => void;
}

export function SelectionPopover({
  selectedText,
  position,
  entityTypes,
  onSelectType,
  onDismiss,
}: SelectionPopoverProps) {
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  const POPOVER_APPROX_HEIGHT = 240;
  const isAbove = window.innerHeight - position.y < POPOVER_APPROX_HEIGHT + 16;

  const truncatedText =
    selectedText.length > 34 ? selectedText.slice(0, 34) + '…' : selectedText;

  const types = Object.entries(entityTypes);

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
        {/* Teal accent line — the precision instrument signature */}
        <div className="h-0.75 bg-accent w-full" />

        {/* Header */}
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

        {/* Selected text preview */}
        <div className="px-3 pb-2.5">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-surface-subtle border border-border-theme">
            <span className="w-1.5 h-1.5 rounded-full bg-accent/70 shrink-0" />
            <span className="text-[11.5px] italic font-mono text-fg leading-tight truncate">
              &ldquo;{truncatedText}&rdquo;
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border-theme mx-0 mb-2.5" />

        {/* Entity type grid */}
        <div className="px-3 pb-3 grid grid-cols-2 gap-1.5 max-h-45 overflow-y-auto">
          {types.map(([type, meta], index) => (
            <button
              key={type}
              ref={index === 0 ? firstButtonRef : undefined}
              onClick={() => onSelectType(type)}
              className={cn(
                'flex items-center gap-2 px-2.5 py-1.75 rounded-lg text-[11.5px] font-medium',
                'border cursor-pointer transition-all duration-100',
                'hover:brightness-95 active:scale-95',
                meta.badge,
              )}
            >
              <span className={cn('w-2 h-2 rounded-full shrink-0', meta.dot)} />
              <span className="truncate leading-none">{meta.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
