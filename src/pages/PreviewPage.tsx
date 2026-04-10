import { ActionsIsland } from '@/components/workflow/ActionsIsland.tsx';
import { PDFPageRenderer } from '@/components/workflow/PDFPageRenderer.tsx';
import { useDocument } from '@/hooks/useDocument.ts';

export function PreviewPage() {
  const { currentPage, zoom, redactedDocument, pendingPages, isRedacting, handleModeChange } = useDocument();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {isRedacting ? (
        <div className="flex-1 overflow-auto bg-[#e8e8ec] dark:bg-[#0e0e14] flex items-center justify-center">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-fg-muted animate-pulse" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-fg-muted animate-pulse" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-fg-muted animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      ) : (
        <>
          {pendingPages.size > 0 && (
            <div className="absolute top-0 left-0 right-0 h-0.5 z-10">
              <div className="h-full bg-accent/60 animate-pulse w-full" />
            </div>
          )}
          <PDFPageRenderer pageIndex={currentPage - 1} zoom={zoom} pdfDocument={redactedDocument} />
        </>
      )}
      <ActionsIsland mode="preview" onModeChange={handleModeChange} />
    </div>
  );
}
