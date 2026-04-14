import { useEffect, useRef, useState } from 'react';
import { ColorSpace, type PDFDocument } from 'mupdf';

import { usePdfProcessing } from '@/hooks/usePdfProcessing.ts';
import { redactPDFDocument } from '@/lib/pdf/redactPDF.ts';
import { cn } from '@/lib/utils.ts';
import type { GroupedEntity } from '@/types/index.ts';

interface PageThumbnailItemProps {
  pageIndex: number;
  pdfDocument: PDFDocument;
  isActive: boolean;
  isPending: boolean;
  onClick: () => void;
}

const THUMBNAIL_CSS_WIDTH = 160;

function PageThumbnailItem({ pageIndex, pdfDocument, isActive, isPending, onClick }: PageThumbnailItemProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState(Math.SQRT2); // A4 default fallback
  const prevUrlRef = useRef<string | null>(null);
  const itemRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    try {
      const page = pdfDocument.loadPage(pageIndex);
      const bounds = page.getBounds(); // [x0, y0, x1, y1]
      const pageWidth = bounds[2] - bounds[0];
      const pageHeight = bounds[3] - bounds[1];

      const dpr = window.devicePixelRatio ?? 1;
      const cssScale = THUMBNAIL_CSS_WIDTH / pageWidth;
      const physicalScale = cssScale * dpr;
      const matrix: [number, number, number, number, number, number] = [physicalScale, 0, 0, physicalScale, 0, 0];

      const pixmap = page.toPixmap(matrix, ColorSpace.DeviceRGB, false);
      const png = pixmap.asPNG();

      if (cancelled) return;

      const blob = new Blob([png as Uint8Array<ArrayBuffer>], { type: 'image/png' });
      const url = URL.createObjectURL(blob);

      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
      prevUrlRef.current = url;

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAspectRatio(pageHeight / pageWidth);
      setImageUrl(url);
    } catch (err) {
      console.error('Thumbnail render error:', err);
    }

    return () => {
      cancelled = true;
    };
  }, [pdfDocument, pageIndex]);

  useEffect(() => {
    return () => {
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    };
  }, []);

  useEffect(() => {
    if (isActive && itemRef.current) {
      itemRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isActive]);

  const thumbnailHeight = Math.round(THUMBNAIL_CSS_WIDTH * aspectRatio);

  return (
    <button
      ref={itemRef}
      onClick={onClick}
      className={cn(
        'group flex flex-col items-center gap-1.5 p-1 rounded-lg transition-all duration-200 cursor-pointer w-full',
        isActive
          ? 'bg-accent/8 dark:bg-accent/12'
          : 'hover:bg-border-theme/60',
      )}
    >
      <div
        className={cn(
          'relative rounded overflow-hidden shadow-sm transition-all duration-200',
          isActive
            ? 'ring-2 ring-accent shadow-md'
            : 'ring-1 ring-border-theme group-hover:ring-border-strong',
        )}
        style={{ width: THUMBNAIL_CSS_WIDTH, height: thumbnailHeight }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Page ${pageIndex + 1}`}
            className="absolute inset-0 w-full h-full object-fill"
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
        )}
        {isPending && (
          <div className="absolute inset-0 bg-surface/60 dark:bg-[#121218]/60 backdrop-blur-[1px] flex items-center justify-center">
            <div className="w-3 h-3 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          </div>
        )}
      </div>

      <span
        className={cn(
          'text-[10px] tabular-nums font-mono leading-none transition-colors duration-200',
          isActive ? 'text-accent font-semibold' : 'text-fg-subtle group-hover:text-fg-muted',
        )}
      >
        {pageIndex + 1}
      </span>
    </button>
  );
}

interface PageThumbnailPanelProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  entities?: GroupedEntity[];
  redactedDocument?: PDFDocument | null;
  pendingPages?: Set<number>;
}

export function PageThumbnailPanel({ currentPage, onPageChange, entities, redactedDocument, pendingPages }: PageThumbnailPanelProps) {
  const { pdfDocument, pageCount, file } = usePdfProcessing();
  const [computedDoc, setComputedDoc] = useState<PDFDocument | null>(null);

  useEffect(() => {
    // Skip internal redaction when a redacted doc is provided from outside
    if (redactedDocument !== undefined || !file || !entities) return;

    const timer = setTimeout(async () => {
      try {
        const doc = await redactPDFDocument(file, entities);
        setComputedDoc(doc);
      } catch (err) {
        console.error('Thumbnail redaction error:', err);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [file, entities, redactedDocument]);

  const displayDoc = redactedDocument ?? computedDoc ?? pdfDocument;

  if (!displayDoc || pageCount <= 1) return null;

  return (
    <div className="absolute top-24.5 bottom-0 left-0 flex flex-col w-64 border-r border-border-theme bg-card overflow-y-auto overflow-x-hidden z-50">
      <div className="flex flex-col gap-1.5 p-2.5 py-4">
        {Array.from({ length: pageCount }, (_, i) => (
          <PageThumbnailItem
            key={i}
            pageIndex={i}
            pdfDocument={displayDoc}
            isActive={currentPage === i + 1}
            isPending={pendingPages?.has(i) ?? false}
            onClick={() => onPageChange(i + 1)}
          />
        ))}
      </div>
    </div>
  );
}
