import { Laptop, WandSparkles, WifiOff } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';

import { DropZone } from '@/components/home/DropZone.tsx';
import { Footer } from '@/components/home/Footer.tsx';
import { Navbar } from '@/components/Navbar.tsx';
import { usePdfProcessing } from '@/hooks/usePdfProcessing.ts';
import { RatureLogo } from '@/components/RatureLogo.tsx';

interface HomePageProps {
  onFileSelect: () => void
}

export function HomePage({ onFileSelect }: HomePageProps) {
  const { t } = useTranslation();
  const { setFile } = usePdfProcessing();

  const handleFileSelected = (file: File) => {
    setFile(file);
    onFileSelect();
  };

  return (
    <div className="flex flex-col justify-between flex-1 h-full">
      <Navbar />

      <section className="flex-1 mx-auto h-full w-full max-w-300 px-6 pt-56 pb-16 flex flex-col gap-16 items-center">
        <h1 className="text-center text-5xl lg:text-6xl font-extrabold text-fg tracking-tight leading-[1.1]">
          <span className="text-accent">{t('home.title')}</span>
          <br/>
          {t('home.subtitle')}
        </h1>

        <div className="grid grid-cols-2 items-center gap-16">
          <p className="text-lg text-fg-muted leading-relaxed max-w-lg">
            <Trans
              i18nKey="home.description"
              components={{
                logo: <RatureLogo size="lg" />,
                bold: <span className="font-bold" />,
                accent: <span className="text-accent font-bold" />,
                br: <br />,
              }}
            />
          </p>

          <div
            className="border border-border-theme bg-card"
            style={{ boxShadow: '0 4px 24px 0 rgb(0 0 0 / 0.06)' }}
          >
            <DropZone onFileSelect={handleFileSelected} />
          </div>
          <ul className="flex items-center gap-4 col-span-2 justify-center">
            <li className="flex items-center gap-2 bg-neutral-300 text-neutral-600 px-4 py-2 font-medium">
              <Laptop size={20} />
              {t('home.badges.local')}
            </li>
            <li className="flex items-center gap-2 bg-neutral-300 text-neutral-600 px-4 py-2 font-medium">
              <WandSparkles size={20} />
              {t('home.badges.detection')}
            </li>
            <li className="flex items-center gap-2 bg-neutral-300 text-neutral-600 px-4 py-2 font-medium">
              <WifiOff size={20} />
              {t('home.badges.noServer')}
            </li>
          </ul>
        </div>
      </section>

      <div className="fixed inset-0 z-100 flex items-center justify-center bg-surface p-8 md:hidden">
        <div className="text-center max-w-sm">
          <p className="text-3xl mb-4">🖥️</p>
          <h2 className="text-xl font-bold text-fg mb-2">{t('home.mobile.title')}</h2>
          <p className="text-sm text-fg-muted">
            <span className="bg-neutral-800 text-neutral-100 px-2 py-1 font-bold [font-variant:small-caps]">rature</span> {t('home.mobile.description')}
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
