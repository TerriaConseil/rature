import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ImageOff } from 'lucide-react';

import { cn } from '@/lib/utils.ts';
import { extractImageThumbnails } from '@/lib/pdf/extractImages.ts';
import { usePdfProcessing } from '@/hooks/usePdfProcessing.ts';
import type { DetectedImage } from '@/types/index.ts';
import { RepeatedImageModal } from '@/components/workflow/RepeatedImageModal.tsx';

interface PendingToggle {
  image: DetectedImage;
  duplicateCount: number;
  thumbnail: string | undefined;
}

export function ImageEditionPage() {
  const { t } = useTranslation();
  const { pdfDocument, detectedImages, setDetectedImages } = usePdfProcessing();

  const [thumbnails, setThumbnails] = useState<Map<string, string>>(new Map());
  const [thumbnailsLoading, setThumbnailsLoading] = useState(true);
  const [pendingToggle, setPendingToggle] = useState<PendingToggle | null>(null);

  // Lazy thumbnail generation on mount
  useEffect(() => {
    if (!pdfDocument) {
      setThumbnailsLoading(false);
      return;
    }

    const objectUrls: string[] = [];
    const newThumbnails = new Map<string, string>();
    const pageIndices = Array.from(new Set(detectedImages.map(img => img.page)));

    for (const pageIndex of pageIndices) {
      try {
        const page = pdfDocument.loadPage(pageIndex);
        const pageThumbs = extractImageThumbnails(page, pageIndex);
        for (const [id, bytes] of pageThumbs) {
          const url = URL.createObjectURL(new Blob([bytes], { type: 'image/png' }));
          objectUrls.push(url);
          newThumbnails.set(id, url);
        }
      } catch {
        // skip page if extraction fails
      }
    }

    setThumbnails(newThumbnails);
    setThumbnailsLoading(false);

    return () => {
      for (const url of objectUrls) URL.revokeObjectURL(url);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfDocument]);

  const imagesByPage = useMemo(() => {
    const map = new Map<number, DetectedImage[]>();
    for (const img of detectedImages) {
      if (!map.has(img.page)) map.set(img.page, []);
      map.get(img.page)!.push(img);
    }
    return map;
  }, [detectedImages]);

  const sortedPages = useMemo(
    () => Array.from(imagesByPage.keys()).sort((a, b) => a - b),
    [imagesByPage],
  );

  const allIncluded = detectedImages.length > 0 && detectedImages.every(img => img.included);

  const handleSelectAll = () => {
    setDetectedImages(detectedImages.map(img => ({ ...img, included: !allIncluded })));
  };

  const handleSelectPage = (pageIndex: number) => {
    const pageImages = imagesByPage.get(pageIndex) ?? [];
    const allPageIncluded = pageImages.length > 0 && pageImages.every(img => img.included);
    const idsOnPage = new Set(pageImages.map(img => img.id));
    setDetectedImages(detectedImages.map(img =>
      idsOnPage.has(img.id) ? { ...img, included: !allPageIncluded } : img,
    ));
  };

  const handleToggleImage = (image: DetectedImage) => {
    const duplicates = detectedImages.filter(
      img => img.fingerprint === image.fingerprint && img.page !== image.page,
    );

    if (duplicates.length === 0) {
      setDetectedImages(detectedImages.map(img =>
        img.id === image.id ? { ...img, included: !img.included } : img,
      ));
    } else {
      setPendingToggle({
        image,
        duplicateCount: duplicates.length,
        thumbnail: thumbnails.get(image.id),
      });
    }
  };

  const handleToggleThisOnly = () => {
    if (!pendingToggle) return;
    const { image } = pendingToggle;
    setDetectedImages(detectedImages.map(img =>
      img.id === image.id ? { ...img, included: !img.included } : img,
    ));
    setPendingToggle(null);
  };

  const handleToggleAllOccurrences = () => {
    if (!pendingToggle) return;
    const { image } = pendingToggle;
    const newIncluded = !image.included;
    setDetectedImages(detectedImages.map(img =>
      img.fingerprint === image.fingerprint ? { ...img, included: newIncluded } : img,
    ));
    setPendingToggle(null);
  };

  return (
    <div className="flex-1 overflow-auto bg-[#e8e8ec] dark:bg-[#0e0e14]">
      <div className="max-w-4xl mx-auto px-6 py-8 pb-24">

        {/* Empty state */}
        {detectedImages.length === 0 && !thumbnailsLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-fg-muted">
            <ImageOff size={32} strokeWidth={1.5} />
            <p className="text-sm">{t('imageEdition.emptyState')}</p>
          </div>
        )}

        {/* Global select-all row */}
        {detectedImages.length > 0 && (
          <div className="flex items-center justify-end mb-6">
            <button
              onClick={handleSelectAll}
              className="text-xs font-medium text-accent hover:text-accent/80 transition-colors cursor-pointer"
            >
              {allIncluded ? t('imageEdition.deselectAll') : t('imageEdition.selectAll')}
            </button>
          </div>
        )}

        {/* Per-page sections */}
        {sortedPages.map(pageIndex => {
          const images = imagesByPage.get(pageIndex) ?? [];
          const allPageIncluded = images.length > 0 && images.every(img => img.included);

          return (
            <section key={pageIndex} className="mb-10">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-fg">
                  {t('pdf.page', { page: pageIndex + 1 })}
                </h2>
                <button
                  onClick={() => handleSelectPage(pageIndex)}
                  className="text-xs font-medium text-accent hover:text-accent/80 transition-colors cursor-pointer"
                >
                  {allPageIncluded ? t('imageEdition.deselectPage') : t('imageEdition.selectPage')}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 xl:grid-cols-4">
                {images.map(image => (
                  <ImageCard
                    key={image.id}
                    image={image}
                    thumbnail={thumbnails.get(image.id)}
                    loading={thumbnailsLoading}
                    onToggle={handleToggleImage}
                    dimensionsLabel={t('imageEdition.dimensions', { w: image.width, h: image.height })}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <RepeatedImageModal
        open={pendingToggle !== null}
        thumbnail={pendingToggle?.thumbnail}
        duplicateCount={pendingToggle?.duplicateCount ?? 0}
        onClose={() => setPendingToggle(null)}
        onThisOnly={handleToggleThisOnly}
        onAllOccurrences={handleToggleAllOccurrences}
      />
    </div>
  );
}

interface ImageCardProps {
  image: DetectedImage;
  thumbnail: string | undefined;
  loading: boolean;
  onToggle: (image: DetectedImage) => void;
  dimensionsLabel: string;
}

function ImageCard({ image, thumbnail, loading, onToggle, dimensionsLabel }: ImageCardProps) {
  return (
    <button
      onClick={() => onToggle(image)}
      className={cn(
        'relative flex flex-col rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer text-left',
        'bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        image.included
          ? 'border-accent shadow-md'
          : 'border-transparent opacity-60 hover:opacity-80',
      )}
    >
      {/* Thumbnail / skeleton */}
      <div className="aspect-[4/3] bg-surface-subtle flex items-center justify-center overflow-hidden">
        {loading ? (
          <div className="w-full h-full animate-pulse bg-border-theme" />
        ) : thumbnail ? (
          <img
            src={thumbnail}
            alt=""
            className="w-full h-full object-contain"
          />
        ) : (
          <ImageOff size={20} className="text-fg-muted" strokeWidth={1.5} />
        )}
      </div>

      {/* Dimensions caption */}
      <div className="px-2 py-1.5">
        <span className="text-[10px] text-fg-muted tabular-nums">{dimensionsLabel}</span>
      </div>

      {/* Checkmark overlay */}
      {image.included && (
        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-accent flex items-center justify-center shadow">
          <Check size={11} strokeWidth={3} className="text-white" />
        </div>
      )}
    </button>
  );
}
