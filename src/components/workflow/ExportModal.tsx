import { useEffect, useState } from 'react';
import { X, Download, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import type { GroupedEntity } from '@/types/index.ts';

interface ExportModalProps {
  entities: GroupedEntity[]
  fileName: string
  onClose: () => void
  onDownload: (opts: { removeMetadata: boolean }) => Promise<void>
}

type ReplaceMode = 'redacted' | 'pseudonym';

const REPLACE_OPTIONS = [
  {
    value: 'redacted' as const,
    label: '[OCCULTÉ]',
    desc: 'Remplace le texte par un marqueur générique',
    disabled: false,
  },
  {
    value: 'pseudonym' as const,
    label: 'Pseudonyme',
    desc: 'Remplace par un identifiant fictif cohérent',
    disabled: true,
  },
] as const;

export function ExportModal({ entities, fileName, onClose, onDownload }: ExportModalProps) {
  const [replaceMode, setReplaceMode] = useState<ReplaceMode>('redacted');
  const [removeMetadata, setRemoveMetadata] = useState(true);
  const [done, setDone] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const includedCount = entities.filter(e => e.included).length;
  const totalPages = Math.max(...entities.map(e => e.page));

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
      await onDownload({ removeMetadata });
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
      <div className="w-full max-w-md rounded-2xl border border-border-theme bg-card shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-theme">
          <h2 className="text-base font-semibold text-fg">Exporter le PDF anonymisé</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-[7px] text-fg-muted hover:text-fg hover:bg-surface-subtle transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {!done ? (
          <>
            <div className="px-6 py-5 space-y-5">
              <div className="rounded-xl bg-surface-subtle border border-border-theme p-4 space-y-1">
                <p className="text-sm text-fg">
                  <span className="font-semibold text-accent">{includedCount} entité{includedCount !== 1 ? 's' : ''}</span>{' '}
                  seront occultées sur{' '}
                  <span className="font-semibold">{totalPages} page{totalPages !== 1 ? 's' : ''}</span>
                </p>
                <p className="text-xs text-fg-muted truncate">{fileName}</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-fg-muted uppercase tracking-wider">Mode de remplacement</p>
                <div className="space-y-2">
                  {REPLACE_OPTIONS.map(opt => (
                    <label
                      key={opt.value}
                      className={[
                        'flex items-start gap-3 p-3 rounded-xl border border-border-theme transition-all',
                        opt.disabled
                          ? 'opacity-50 cursor-not-allowed pointer-events-none'
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
                        className="mt-0.5 accent-accent cursor-pointer"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-fg">{opt.label}</p>
                          {opt.disabled && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wider uppercase bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
                              Bientôt disponible
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-fg-muted">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={removeMetadata}
                  onChange={e => setRemoveMetadata(e.target.checked)}
                  className="w-4 h-4 accent-accent cursor-pointer rounded"
                />
                <div>
                  <p className="text-sm font-medium text-fg group-hover:text-accent transition-colors">
                    Supprimer les métadonnées
                  </p>
                  <p className="text-xs text-fg-muted">
                    Auteur, date de création, propriétés du document original
                  </p>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-theme">
              <Button variant="secondary" onClick={onClose} disabled={isDownloading}>
                Annuler
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
                    Télécharger le PDF
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
              <p className="text-base font-semibold text-fg mb-1">Document exporté avec succès</p>
              <p className="text-sm text-fg-muted">
                Votre PDF anonymisé a été téléchargé.
              </p>
            </div>
            <Button variant="secondary" onClick={onClose}>
              Fermer
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
