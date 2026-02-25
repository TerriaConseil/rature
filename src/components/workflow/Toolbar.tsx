import { ArrowLeft, RotateCcw, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';

interface ToolbarProps {
  fileName: string
  currentPage: number
  totalPages: number
  zoom: number
  onBack: () => void
  onPrevPage: () => void
  onNextPage: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onRescan: () => void
  onExport: () => void
}

export function Toolbar({
  fileName,
  currentPage,
  totalPages,
  zoom,
  onBack,
  onPrevPage,
  onNextPage,
  onZoomIn,
  onZoomOut,
  onRescan,
  onExport,
}: ToolbarProps) {
  return (
    <div className="h-14 border-b border-border-theme bg-card flex items-center gap-3 px-4 shrink-0">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg transition-colors cursor-pointer"
      >
        <ArrowLeft size={15} />
        <span className="hidden sm:inline">Accueil</span>
      </button>

      <div className="w-px h-5 bg-border-theme" />

      {/* File name */}
      <span className="text-sm font-medium text-fg truncate max-w-[200px]" title={fileName}>
        {fileName}
      </span>

      <div className="flex-1" />

      {/* Page navigation */}
      <div className="flex items-center gap-1">
        <button
          onClick={onPrevPage}
          disabled={currentPage <= 1}
          className="flex items-center justify-center w-7 h-7 rounded-[6px] text-fg-muted hover:text-fg hover:bg-surface-subtle disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
        >
          <ChevronLeft size={15} />
        </button>
        <span className="text-xs text-fg-muted tabular-nums px-1">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={onNextPage}
          disabled={currentPage >= totalPages}
          className="flex items-center justify-center w-7 h-7 rounded-[6px] text-fg-muted hover:text-fg hover:bg-surface-subtle disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      <div className="w-px h-5 bg-border-theme" />

      {/* Zoom */}
      <div className="flex items-center gap-1">
        <button
          onClick={onZoomOut}
          className="flex items-center justify-center w-7 h-7 rounded-[6px] text-fg-muted hover:text-fg hover:bg-surface-subtle transition-all cursor-pointer"
        >
          <ZoomOut size={15} />
        </button>
        <span className="text-xs text-fg-muted tabular-nums w-10 text-center">{zoom}%</span>
        <button
          onClick={onZoomIn}
          className="flex items-center justify-center w-7 h-7 rounded-[6px] text-fg-muted hover:text-fg hover:bg-surface-subtle transition-all cursor-pointer"
        >
          <ZoomIn size={15} />
        </button>
      </div>

      <div className="w-px h-5 bg-border-theme" />

      {/* Actions */}
      <Button variant="secondary" size="sm" onClick={onRescan}>
        <RotateCcw size={13} />
        Ré-analyser
      </Button>

      <Button size="sm" onClick={onExport}>
        <Download size={13} />
        Exporter le PDF
      </Button>
    </div>
  );
}
