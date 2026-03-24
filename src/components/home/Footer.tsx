import { Link } from "react-router";
import { useTranslation } from "react-i18next";

import { LanguageSwitcher } from "@/components/LanguageSwitcher.tsx";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="sticky bottom-0 border-t border-border-theme py-8 bg-surface/30 backdrop-blur-md z-20">
      <div className="absolute -top-16 left-0 right-0 h-16 pointer-events-none" />
      <div className="mx-auto max-w-300 px-6 flex flex-wrap items-center justify-center gap-3">
        <p className="text-sm text-fg/70">
          © {new Date().getFullYear()} Terria Conseil
        </p>
        <p className="text-sm text-fg/80">•</p>
        <a
          href="https://github.com/TerriaConseil/rature"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-fg/70 hover:text-fg transition-colors"
        >
          {t('footer.source')}
        </a>
        <p className="text-sm text-fg/80">•</p>
        <nav className="flex items-center gap-4">
          <Link
            to="/privacy-policy"
            className="text-sm text-fg/70 hover:text-fg transition-colors"
          >
            {t('footer.privacy')}
          </Link>
        </nav>
        <p className="text-sm text-fg/80">•</p>
        <LanguageSwitcher />
      </div>
    </footer>
  );
}
