import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Download,
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
