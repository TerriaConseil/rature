import { ScanLine } from "lucide-react";
import { useTranslation } from "react-i18next";

export function EmptyPDFPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center text-center max-w-xs gap-5 select-none">
      <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
        <ScanLine
          size={28}
          strokeWidth={1.5}
          className="text-gray-400 dark:text-gray-500"
        />
        <span className="absolute -bottom-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-teal-500/15 ring-2 ring-white dark:ring-[#2a2a36]">
          <span className="block h-1.5 w-1.5 rounded-full bg-teal-500" />
        </span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-bold text-gray-500 dark:text-gray-400 tracking-wide">
          {t('emptyPage.title')}
        </p>
        <p className="text-[12px] leading-relaxed text-fg-muted max-w-55">
          {t('emptyPage.description')}
        </p>
      </div>

      <div className="flex items-center gap-1.5 rounded-full border border-teal-200 dark:border-teal-800/60 bg-teal-50 dark:bg-teal-950/30 px-3 py-2 text-sm font-medium text-teal-600 dark:text-teal-400 tracking-wide">
        <p className="flex items-center justify-center h-4 w-4">
          <span className="block h-1.5 w-1.5 rounded-full bg-teal-500" />
        </p>
        <span>{t('emptyPage.comingSoon')}</span>
      </div>
    </div>
  );
}
