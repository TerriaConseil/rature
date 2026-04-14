import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

import addEntityVideo from "@/assets/help/add-entity.webm";
import removeEntityVideo from "@/assets/help/remove-entity.webm";
import updateEntityVideo from "@/assets/help/update-entity.webm";
import { useEffect } from "react";

export type HelpModalKind = 'add' | 'update' | 'remove';

const sources = {
  add: addEntityVideo,
  remove: removeEntityVideo,
  update: updateEntityVideo,
};

interface HelpModalProps {
  kind: HelpModalKind;
  open: boolean;
  onClose: () => void;
}

export function HelpModal({ kind, open, onClose }: HelpModalProps) {
  const { t } = useTranslation();

  const videoSrc = sources[kind];

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
      <div className="w-full max-w-2xl rounded-2xl border border-border-theme bg-card shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-theme">
          <h2 className="text-base font-semibold text-fg">
            {t(`help.modal.${kind}.title`)}
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-[7px] text-fg-muted hover:text-fg hover:bg-surface-subtle transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5 space-y-3">
          <p className="text-sm text-fg">
            {t(`help.modal.${kind}.step1`)}
          </p>
          <p className="text-sm text-fg">
            {t(`help.modal.${kind}.step2`)}
          </p>
          {kind !== 'add' && (
            <p className="text-sm text-fg">
              {t(`help.modal.${kind}.step3`)}
            </p>
          )}

          {videoSrc && (
            <div className="w-full aspect-video rounded-3xl relative leading-0 overflow-hidden">
              <video src={videoSrc} className="absolute inset-0 object-cover" muted loop autoPlay />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
