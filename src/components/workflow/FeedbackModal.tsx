import { useEffect } from 'react';
import { X, MessageSquarePlus, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { RatureLogo } from '@/components/RatureLogo.tsx';

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
}

function GithubIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

export function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const { t } = useTranslation();
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-border-theme bg-card shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-theme">
          <h2 className="text-base font-semibold text-fg">{t('feedback.title')}</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-[7px] text-fg-muted hover:text-fg hover:bg-surface-subtle transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-3">
          <p className="text-sm text-fg-muted">
            {t('feedback.description')}
          </p>
          <a
            href="https://github.com/TerriaConseil/rature/issues/new?template=bug_report.md"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex items-center gap-3 p-4 rounded-xl border border-border-theme hover:border-accent/50 hover:bg-surface-subtle transition-all duration-200 cursor-pointer group"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-surface-subtle border border-border-theme text-fg group-hover:border-accent/30 transition-colors duration-200 shrink-0">
              <GithubIcon size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-fg">{t('feedback.githubIssue')}</p>
              <p className="text-xs text-fg-muted">{t('feedback.githubIssueSub')}</p>
            </div>
            <ChevronRight size={14} className="text-fg-subtle shrink-0" />
          </a>
          <a
            href="https://github.com/TerriaConseil/rature/issues/new?template=feature_request.md"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex items-center gap-3 p-4 rounded-xl border border-border-theme hover:border-accent/50 hover:bg-surface-subtle transition-all duration-200 cursor-pointer group"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-surface-subtle border border-border-theme text-fg group-hover:border-accent/30 transition-colors duration-200 shrink-0">
              <GithubIcon size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-fg">{t('feedback.githubRequest')}</p>
              <p className="text-xs text-fg-muted">{t('feedback.githubRequestSub')}</p>
            </div>
            <ChevronRight size={14} className="text-fg-subtle shrink-0" />
          </a>

          <a
            href="https://rature.fider.io/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex items-center gap-3 p-4 rounded-xl border border-border-theme hover:border-accent/50 hover:bg-surface-subtle transition-all duration-200 cursor-pointer group"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 text-accent shrink-0">
              <MessageSquarePlus size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-fg">{t('feedback.fider')}</p>
              <p className="text-xs text-fg-muted">{t('feedback.fiderSub')}</p>
            </div>
            <ChevronRight size={14} className="text-fg-subtle shrink-0" />
          </a>
        </div>

        <div className="px-6 py-4 border-t border-border-theme">
          <p className="text-xs text-fg-subtle text-center">{t('feedback.thanks')} <RatureLogo size="sm" /></p>
        </div>
      </div>
    </div>
  );
}
