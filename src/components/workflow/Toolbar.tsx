import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Download,
  Pencil,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { cn } from '@/lib/utils.ts';
import type { WorkflowMode } from '@/types/index.ts';

interface ToolbarProps {
  fileName: string
  currentPage: number
  totalPages: number
  zoom: number
  mode: WorkflowMode
  onModeChange: (mode: WorkflowMode) => void
  onBack: () => void
  onPrevPage: () => void
  onNextPage: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onExport: () => void
}

export function Toolbar({
  fileName,
  currentPage,
  totalPages,
  zoom,
  mode,
  onModeChange,
  onBack,
  onPrevPage,
  onNextPage,
  onZoomIn,
  onZoomOut,
  onExport,
}: ToolbarProps) {
  return (
    <div className={cn(
      'h-14 border-b flex items-center gap-3 px-4 shrink-0 transition-all duration-300 relative overflow-hidden',
      mode === 'preview'
        ? 'bg-teal-50 dark:bg-teal-950/30 border-accent/50 dark:border-accent/30'
        : 'bg-card border-border-theme',
    )}>
      {mode === 'preview' && (
        <div className="absolute top-0 inset-x-0 h-0.75 bg-accent" />
      )}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg transition-colors cursor-pointer"
      >
        <ArrowLeft size={15} />
        <span className="hidden sm:inline">Retour</span>
      </button>

      <div className="w-px h-5 bg-border-theme" />

      <span className="text-sm font-medium text-fg truncate max-w-50" title={fileName}>
        {fileName}
      </span>

      <div className="flex items-center rounded-lg border border-border-theme bg-surface-subtle p-0.5 gap-0.5">
        <button
          onClick={() => onModeChange('edition')}
          className={cn(
            'flex items-center gap-1.5 h-6 px-2.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer',
            mode === 'edition' ? 'bg-card text-fg shadow-sm' : 'text-fg-muted hover:text-fg',
          )}
        >
          <Pencil size={12} />
          <span>Édition</span>
        </button>
        <button
          onClick={() => onModeChange('preview')}
          className={cn(
            'flex items-center gap-1.5 h-6 px-2.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer',
            mode === 'preview' ? 'bg-accent text-white shadow-sm' : 'text-fg-muted hover:text-fg',
          )}
        >
          <Eye size={12} />
          <span>Aperçu</span>
        </button>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        <button
          onClick={onPrevPage}
          disabled={currentPage <= 1}
          className="flex items-center justify-center w-7 h-7 rounded-md text-fg-muted hover:text-fg hover:bg-surface-subtle disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
        >
          <ChevronLeft size={15} />
        </button>
        <span className="text-xs text-fg-muted tabular-nums px-1">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={onNextPage}
          disabled={currentPage >= totalPages}
          className="flex items-center justify-center w-7 h-7 rounded-md text-fg-muted hover:text-fg hover:bg-surface-subtle disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      <div className="w-px h-5 bg-border-theme" />

      <div className="flex items-center gap-1">
        <button
          onClick={onZoomOut}
          className="flex items-center justify-center w-7 h-7 rounded-md text-fg-muted hover:text-fg hover:bg-surface-subtle transition-all cursor-pointer"
        >
          <ZoomOut size={15} />
        </button>
        <span className="text-xs text-fg-muted tabular-nums w-10 text-center">{zoom}%</span>
        <button
          onClick={onZoomIn}
          className="flex items-center justify-center w-7 h-7 rounded-md text-fg-muted hover:text-fg hover:bg-surface-subtle transition-all cursor-pointer"
        >
          <ZoomIn size={15} />
        </button>
      </div>

      <div className="w-px h-5 bg-border-theme" />

      <Button size="sm" onClick={onExport}>
        <Download size={13} />
        Exporter le PDF
      </Button>
    </div>
  );
}
