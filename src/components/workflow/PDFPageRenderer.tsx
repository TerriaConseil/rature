import { useEffect, useRef, useState } from 'react';
import { ColorSpace, type PDFDocument } from 'mupdf';
import { useTranslation } from 'react-i18next';

import { usePdfProcessing } from '@/hooks/usePdfProcessing.ts';

interface PDFPageRendererProps {
  pageIndex: number;
  zoom: number;
  pdfDocument?: PDFDocument | null;
}

export function PDFPageRenderer({ pageIndex, zoom, pdfDocument: propDocument }: PDFPageRendererProps) {
  const { t } = useTranslation();
  const { pdfDocument: contextDocument } = usePdfProcessing();
  const pdfDocument = propDocument ?? contextDocument;
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [cssSize, setCssSize] = useState<{ width: number; height: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const prevUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pdfDocument) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setError(null);

    let cancelled = false;

    try {
      const page = pdfDocument.loadPage(pageIndex);
      const bounds = page.getBounds(); // [x0, y0, x1, y1] in PDF units

      // Render at physical pixels: multiply by DPR so the image is sharp on HiDPI screens
      const dpr = window.devicePixelRatio ?? 1;
      const scale = (zoom / 100) * dpr;
      const matrix: [number, number, number, number, number, number] = [scale, 0, 0, scale, 0, 0];
      const pixmap = page.toPixmap(matrix, ColorSpace.DeviceRGB, false);
      const png = pixmap.asPNG();

      if (cancelled) return;

      const blob = new Blob([png as Uint8Array<ArrayBuffer>], { type: 'image/png' });
      const url = URL.createObjectURL(blob);

      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current);
      }
      prevUrlRef.current = url;

      // CSS dimensions are independent of DPR — the browser maps these to physical pixels
      setCssSize({
        width: (bounds[2] - bounds[0]) * (zoom / 100),
        height: (bounds[3] - bounds[1]) * (zoom / 100),
      });
      setImageUrl(url);
      setIsLoading(false);
    } catch (err) {
      if (cancelled) return;
      console.error('MuPDF render error:', err);
      setError(t('pdf.renderError'));
      setIsLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [pdfDocument, pageIndex, zoom]);

  useEffect(() => {
    return () => {
      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto bg-[#e8e8ec] dark:bg-[#0e0e14] flex items-center justify-center">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-fg-muted animate-pulse" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-fg-muted animate-pulse" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-fg-muted animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 overflow-auto bg-[#e8e8ec] dark:bg-[#0e0e14] flex items-center justify-center">
        <p className="text-sm text-fg-muted">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-[#e8e8ec] dark:bg-[#0e0e14] flex justify-center py-16 px-4">
      <img
        src={imageUrl!}
        alt={t('pdf.pageAlt', { page: pageIndex + 1 })}
        className="rounded self-start"
        style={{
          width: cssSize?.width,
          height: cssSize?.height,
          maxWidth: '100%',
          display: 'block',
          boxShadow: '0 2px 8px rgb(0 0 0 / 0.07)',
        }}
        draggable={false}
      />
    </div>
  );
}
