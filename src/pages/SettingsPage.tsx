import { ExternalLink, Moon, PauseCircle, PlayCircle, RefreshCcw, Sun, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { Trans, useTranslation } from "react-i18next";

import { Footer } from "@/components/home/Footer.tsx";
import { LanguageSwitcher } from "@/components/LanguageSwitcher.tsx";
import { Navbar } from "@/components/Navbar.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useTheme } from "@/hooks/useTheme.tsx";
import { cn } from '@/lib/utils.ts';
import { NER_MODELS, NER_MODELS_NAMES } from "@/models/utils.ts";

const bold = <span className="font-bold" />;
const italic = <span className="italic" />;

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const [analyticsEnabled, setAnalyticsEnabled] = useState(
    () => localStorage.getItem('umami.disabled') !== '1'
  );

  const handleOptIn = () => {
    localStorage.removeItem('umami.disabled');
    setAnalyticsEnabled(true);
  };

  const handleOptOut = () => {
    localStorage.setItem('umami.disabled', '1');
    setAnalyticsEnabled(false);
  };

  return (
    <div className="flex flex-col justify-between flex-1 h-full">
      <Navbar />

      <section className="flex-1 mx-auto h-full w-full max-w-300 px-6 pt-40 pb-16">
        <h1 className="flex items-baseline justify-center gap-3 text-center text-4xl font-extrabold tracking-tight leading-[1.1] mb-8">
          {t('settings.title')}
        </h1>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">
            <div
              className="p-6 border border-border-theme bg-card"
              style={{ boxShadow: '0 4px 24px 0 rgb(0 0 0 / 0.06)' }}
            >
              <h3 className="text-2xl font-extrabold">{t('settings.documents.title')}</h3>
              <div className="mt-6">
                <p className="text-md font-bold">{t('settings.documents.model.title')}</p>
                <p className="mt-1 text-fg-muted">
                  <Trans i18nKey="settings.documents.model.description1" components={{ bold, italic }} />
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {NER_MODELS_NAMES.map((modelKey) => {
                    const model = NER_MODELS[modelKey];
                    return (
                      <div key={modelKey} className="flex flex-col gap-3 p-4 border border-border-theme bg-background">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm leading-tight">{model.label}</p>
                          {model.label === 'BERT Base NER' && (
                            <div className={cn(
                              'px-2 py-1 rounded-full text-xs font-semibold border',
                              'bg-transparent text-fg-muted border-border-theme',
                            )}>
                              {t('settings.documents.model.table.default')}
                            </div>
                          )}
                        </div>
                        <ul className="flex flex-col gap-3 text-xs text-fg-muted">
                          <li className="flex gap-1">
                            <span className="font-semibold">{t('settings.documents.model.table.language')}</span>
                            <span>{model.language}</span>
                          </li>
                          <li className="flex gap-1">
                            <span className="font-semibold">{t('settings.documents.model.table.size')}</span>
                            <span>{model.size}</span>
                          </li>
                        </ul>
                        <a href={model.url} target="_blank" rel="noopener noreferrer" className="mt-auto">
                          <Button size="sm" variant="ghost" className="w-full">
                            <ExternalLink size={12} />
                            {t('settings.documents.model.table.learnMore')}
                          </Button>
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-6">
                <p className="text-md font-bold">{t('settings.documents.supported.title')}</p>
                <p className="mt-1 text-fg-muted">
                  {t('settings.documents.supported.description1')}
                  <br />
                  <br />
                  {t('settings.documents.supported.description2')} <a href="mailto:contact@rature.fr" className="underline underline-offset-4">contact@rature.fr</a>
                  <br />
                  <br />
                  {t('settings.documents.supported.feedback')}
                </p>
              </div>
            </div>
            <div
              className="p-6 border border-border-theme bg-card"
              style={{ boxShadow: '0 4px 24px 0 rgb(0 0 0 / 0.06)' }}
            >
              <h3 className="text-2xl font-bold">{t('settings.privacy.title')}</h3>
              <div className="mt-6">
                <p className="text-md font-bold">{t('settings.privacy.stats.title')}</p>
                <p className="mt-1 text-fg-muted">
                  <Trans
                    i18nKey="settings.privacy.stats.description1"
                    components={{
                      umamiLink: <a href="https://umami.is/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4" />
                    }}
                  />
                  <br />
                  <br />
                  <Trans
                    i18nKey="settings.privacy.stats.description2"
                    components={{
                      policyLink: <Link to="/privacy-policy" className="underline underline-offset-4" />
                    }}
                  />
                  <br />
                  <br />
                  {t('settings.privacy.stats.description3')}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <Button
                    size="lg"
                    variant={analyticsEnabled ? 'primary' : 'secondary'}
                    className="w-full flex-1 transition-all"
                    onClick={handleOptIn}
                  >
                    <PlayCircle size={20} />
                    {t('settings.privacy.stats.subscribe')}
                  </Button>
                  <Button
                    size="lg"
                    variant={analyticsEnabled ? 'secondary' : 'primary'}
                    className="w-full flex-1 transition-all"
                    onClick={handleOptOut}
                  >
                    <PauseCircle size={20} />
                    {t('settings.privacy.stats.unsubscribe')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col grow shrink-0 gap-4">
            <div
              className="p-6 border border-border-theme bg-card"
              style={{ boxShadow: '0 4px 24px 0 rgb(0 0 0 / 0.06)' }}
            >
              <h3 className="text-2xl font-extrabold">{t('settings.appearance.title')}</h3>
              <div className="mt-6">
                <p className="text-md font-bold">{t('settings.appearance.theme.title')}</p>
                <p className="mt-1 text-fg-muted">
                  <Trans i18nKey="settings.appearance.theme.description" components={{ bold: <span className="font-medium" /> }} />
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <Button
                    size="lg"
                    variant={theme === 'light' ? 'primary' : 'secondary'}
                    onClick={toggleTheme}
                    className="w-full flex-1 transition-all"
                  >
                    <Sun size={20} />
                    {t('settings.appearance.theme.light')}
                  </Button>
                  <Button
                    size="lg"
                    variant={theme === 'dark' ? 'primary' : 'secondary'}
                    onClick={toggleTheme}
                    className="w-full flex-1 transition-all"
                  >
                    <Moon size={20} />
                    {t('settings.appearance.theme.dark')}
                  </Button>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-md font-bold">{t('settings.appearance.language.title')}</p>
                <p className="mt-1 text-fg-muted">
                  {t('settings.appearance.language.description')}
                </p>
                <LanguageSwitcher variant="full" className="mt-4" />
              </div>
            </div>
            <div
              className="p-6 border border-border-theme bg-card"
              style={{ boxShadow: '0 4px 24px 0 rgb(0 0 0 / 0.06)' }}
            >
              <h3 className="text-2xl font-bold">{t('settings.cache.title')}</h3>
              <div className="mt-6">
                <p className="text-md font-bold">{t('settings.cache.files.title')}</p>
                <p className="mt-1 text-fg-muted">
                  {t('settings.cache.files.description1')}
                  <br />
                  <br />
                  {t('settings.cache.files.description2')}
                  <br />
                  <br />
                  {t('settings.cache.files.description3')}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="w-full flex-1 p-4 bg-gray-100">
                    <p className="text-fg-muted font-medium text-sm">{t('settings.cache.totalSize')}</p>
                    <p className="mt-2 text-fg font-bold text-xl">{t('settings.cache.totalSizeValue')}</p>
                  </div>
                  <div className="w-full flex-1 p-4 bg-gray-100">
                    <p className="text-fg-muted font-medium text-sm">{t('settings.cache.fileCount')}</p>
                    <p className="mt-2 text-fg font-bold text-xl">0</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Button size="lg" variant="secondary" className="w-full flex-1" disabled>
                    <RefreshCcw size={20} />
                    {t('settings.cache.refresh')}
                  </Button>
                  <Button size="lg" variant="secondary" className="w-full flex-1" disabled>
                    <Trash2 size={20} />
                    {t('settings.cache.delete')}
                  </Button>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-md font-bold">{t('settings.cache.siteData.title')}</p>
                <p className="mt-1 text-fg-muted">
                  {t('settings.cache.siteData.description')}
                </p>
                <Button size="lg" variant="secondary" className="mt-4 w-full flex-1" disabled>
                  <Trash2 size={20} />
                  {t('settings.cache.siteData.deleteAll')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
