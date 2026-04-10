import { cn } from "@/lib/utils.ts";
import type { WorkflowMode } from "@/types/index.ts";
import { Eye, Image, Pencil } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ActionsIslandProps {
  mode: WorkflowMode
  onModeChange: (mode: WorkflowMode) => void
}

export function ActionsIsland({ mode, onModeChange }: ActionsIslandProps) {
  const { t } = useTranslation();
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center rounded-xl border border-border-theme bg-card p-1 gap-0.5" style={{ boxShadow: '0 8px 32px rgb(0 0 0 / 0.18), 0 2px 8px rgb(0 0 0 / 0.1)' }}>
      <button
        onClick={() => onModeChange('edition')}
        className={cn(
          'flex items-center gap-2 h-8 px-3 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer',
          mode === 'edition' ? 'bg-surface-subtle text-fg shadow-sm' : 'text-fg-muted hover:text-fg',
        )}
      >
        <Pencil size={14} />
        <span>{t('toolbar.textEdition')}</span>
      </button>
      <button
        onClick={() => onModeChange('image-edition')}
        className={cn(
          'flex items-center gap-2 h-8 px-3 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer',
          mode === 'image-edition' ? 'bg-surface-subtle text-fg shadow-sm' : 'text-fg-muted hover:text-fg',
        )}
      >
        <Image size={14} />
        <span>{t('toolbar.imageEdition')}</span>
      </button>
      <button
        onClick={() => onModeChange('preview')}
        className={cn(
          'flex items-center gap-2 h-8 px-3 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer',
          mode === 'preview' ? 'bg-accent text-white shadow-sm' : 'text-fg-muted hover:text-fg',
        )}
      >
        <Eye size={14} />
        <span>{t('toolbar.preview')}</span>
      </button>
    </div>
  );
}
