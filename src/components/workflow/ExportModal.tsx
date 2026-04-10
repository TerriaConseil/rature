import { useEffect, useState } from 'react';
import { X, Download, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button.tsx';
import type { GroupedEntity, ImageRedactionMethod } from '@/types/index.ts';

interface ExportModalProps {
  entities: GroupedEntity[]
  fileName: string
  includedImageCount: number
  imageMethod: ImageRedactionMethod
  onImageMethodChange: (method: ImageRedactionMethod) => void
  onClose: () => void
  onDownload: (opts: { removeMetadata: boolean; exportFileName: string }) => Promise<void>
}

type ReplaceMode = 'redacted' | 'pseudonym';

export function ExportModal({ entities, fileName, includedImageCount, imageMethod, onImageMethodChange, onClose, onDownload }: ExportModalProps) {
  const { t } = useTranslation();
  const [replaceMode, setReplaceMode] = useState<ReplaceMode>('redacted');
  const [removeMetadata, setRemoveMetadata] = useState(true);
  const [done, setDone] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const originalBaseName = fileName.replace(/\.pdf$/i, '');
  const [exportFileName, setExportFileName] = useState(() => t('export.defaultFileName'));
  const [keepOriginalName, setKeepOriginalName] = useState(false);

  const effectiveFileName = keepOriginalName ? originalBaseName : exportFileName;

  const includedCount = entities.filter(e => e.included).length;
  const totalPages = Math.max(...entities.map(e => e.page));

  const replaceOptions: Array<{ value: ReplaceMode; label: string; desc: string; disabled: boolean }> = [
    { value: 'redacted', label: t('export.redactedLabel'), desc: t('export.redactedDesc'), disabled: false },
    { value: 'pseudonym', label: t('export.pseudonymLabel'), desc: t('export.pseudonymDesc'), disabled: true },
  ];

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Use default file name if input is empty
      const fileName = effectiveFileName || t('export.defaultFileName');

      await onDownload({ removeMetadata, exportFileName: fileName });
      setDone(true);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-2xl rounded-2xl border border-border-theme bg-card shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-theme">
          <h2 className="text-base font-semibold text-fg">{t('export.title')}</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-[7px] text-fg-muted hover:text-fg hover:bg-surface-subtle transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {!done ? (
          <>
            <div className="bg-blend-saturation border-b border-border-theme p-4">
              <p className="text-sm text-fg">
                <span className="font-semibold text-accent">{t('export.entityCount', { count: includedCount })}</span>{' '}
                {t('export.willBeRedacted')}{' '}
                <span className="font-semibold">{t('export.pageCount', { count: totalPages })}</span>
              </p>
            </div>
            <div className="flex flex-col gap-4 px-6 py-5 space-y-5">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-fg uppercase tracking-wider">
                  {t('export.fileNameLabel')}
                </p>
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={effectiveFileName}
                      onChange={e => setExportFileName(e.target.value)}
                      disabled={keepOriginalName}
                      className={[
                        'w-full rounded-xl border border-border-theme bg-surface-subtle px-3 py-2 text-sm text-fg',
                        'placeholder:text-fg-muted focus:outline-none focus:border-accent/60 transition-colors',
                        keepOriginalName ? 'opacity-50 cursor-not-allowed' : '',
                      ].join(' ')}
                      placeholder={t('export.defaultFileName')}
                      spellCheck={false}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-fg-muted pointer-events-none select-none">
                      .pdf
                    </span>
                  </div>
                  <p className="text-xs text-fg-subtle">{t('export.fileNameHint')}</p>
                  <label className="flex items-center gap-3 cursor-pointer group mt-1">
                    <input
                      type="checkbox"
                      checked={keepOriginalName}
                      onChange={e => setKeepOriginalName(e.target.checked)}
                      className="w-4 h-4 accent-accent cursor-pointer rounded"
                    />
                    <div>
                      <p className="text-sm text-fg group-hover:text-accent transition-colors">
                        {t('export.keepOriginalName')}
                      </p>
                      <p className="text-xs text-fg-muted">{t('export.keepOriginalNameDesc')}</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-fg uppercase tracking-wider">
                  {t('export.replaceMode')}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {replaceOptions.map(opt => (
                    <label
                      key={opt.value}
                      className={[
                        'flex flex-col gap-1 p-3 rounded-xl border border-border-theme transition-all',
                        opt.disabled
                          ? 'opacity-50 cursor-not-allowed pointer-events-none'
                          : replaceMode === opt.value
                            ? 'border-accent/60 bg-accent/5 cursor-pointer'
                            : 'hover:border-accent/50 cursor-pointer',
                      ].join(' ')}
                    >
                      <input
                        type="radio"
                        name="replace-mode"
                        value={opt.value}
                        checked={replaceMode === opt.value}
                        onChange={() => !opt.disabled && setReplaceMode(opt.value)}
                        disabled={opt.disabled}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm text-fg">{opt.label}</p>
                        {opt.disabled && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wider uppercase bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
                            {t('export.comingSoon')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-fg-muted">{opt.desc}</p>
                    </label>
                  ))}
                </div>
              </div>

              {includedImageCount > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-fg uppercase tracking-wider">
                    {t('imageEdition.method.label')}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {(['none', 'pixels', 'remove'] as ImageRedactionMethod[]).map(method => (
                      <label
                        key={method}
                        className={[
                          'flex flex-col gap-1 p-3 rounded-xl border border-border-theme cursor-pointer transition-all',
                          imageMethod === method
                            ? 'border-accent/60 bg-accent/5'
                            : 'hover:border-accent/50',
                        ].join(' ')}
                      >
                        <input
                          type="radio"
                          name="image-method"
                          value={method}
                          checked={imageMethod === method}
                          onChange={() => onImageMethodChange(method)}
                          className="sr-only"
                        />
                        <p className="text-sm text-fg">{t(`imageEdition.method.${method}`)}</p>
                        <p className="text-xs text-fg-muted">{t(`imageEdition.method.${method}Desc`)}</p>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-xs font-semibold text-fg uppercase tracking-wider">
                  {t('export.metadata')}
                </p>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={removeMetadata}
                    onChange={e => setRemoveMetadata(e.target.checked)}
                    className="w-4 h-4 accent-accent cursor-pointer rounded"
                  />
                  <div>
                    <p className="text-sm text-fg group-hover:text-accent transition-colors">
                      {t('export.removeMetadata')}
                    </p>
                    <p className="text-xs text-fg-muted">
                      {t('export.removeMetadataDesc')}
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-theme">
              <Button variant="secondary" onClick={onClose} disabled={isDownloading}>
                {t('export.cancel')}
              </Button>
              <Button onClick={handleDownload} disabled={isDownloading}>
                {isDownloading ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" style={{ animationDelay: '300ms' }} />
                  </span>
                ) : (
                  <>
                    <Download size={15} />
                    {t('export.download')}
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-teal-50 dark:bg-teal-950/30 text-accent">
              <CheckCircle size={28} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-base font-semibold text-fg mb-1">{t('export.successTitle')}</p>
              <p className="text-sm text-fg-muted">
                {t('export.successDesc')}
              </p>
            </div>
            <Button variant="secondary" onClick={onClose}>
              {t('export.close')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
