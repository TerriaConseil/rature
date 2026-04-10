import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button.tsx';

export interface RepeatedImageModalProps {
  open: boolean;
  thumbnail: string | undefined;
  duplicateCount: number;
  onClose: () => void;
  onThisOnly: () => void;
  onAllOccurrences: () => void;
}

export function RepeatedImageModal({
  open,
  thumbnail,
  duplicateCount,
  onClose,
  onThisOnly,
  onAllOccurrences,
}: RepeatedImageModalProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-border-theme bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-theme">
          <h2 className="text-base font-semibold text-fg">
            {t('imageEdition.modal.title')}
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-[7px] text-fg-muted hover:text-fg hover:bg-surface-subtle transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Thumbnail preview */}
          {thumbnail && (
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-xl overflow-hidden border border-border-theme bg-surface-subtle flex items-center justify-center">
                <img src={thumbnail} alt="" className="w-full h-full object-contain" />
              </div>
            </div>
          )}

          <p className="text-sm text-fg-muted text-center">
            {t('imageEdition.modal.body', { count: duplicateCount })}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 px-6 pb-6">
          <Button onClick={onAllOccurrences} className="w-full justify-center">
            {t('imageEdition.modal.allOccurrences')}
          </Button>
          <Button variant="secondary" onClick={onThisOnly} className="w-full justify-center">
            {t('imageEdition.modal.thisOnly')}
          </Button>
        </div>
      </div>
    </div>
  );
}
