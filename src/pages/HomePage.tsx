import { Laptop, WandSparkles, WifiOff } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';

import { DropZone } from '@/components/home/DropZone.tsx';
import { Footer } from '@/components/home/Footer.tsx';
import { Navbar } from '@/components/Navbar.tsx';
import { usePdfProcessing } from '@/hooks/usePdfProcessing.ts';
import { RatureLogo } from '@/components/RatureLogo.tsx';

interface HomePageProps {
  onFileSelect: () => void;
}

const BADGES = [
  { icon: Laptop, key: 'home.badges.local' },
  { icon: WandSparkles, key: 'home.badges.detection' },
  { icon: WifiOff, key: 'home.badges.noServer' },
] as const;

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

      <div
        className="fixed inset-0 pointer-events-none z-0"
        aria-hidden="true"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(13, 148, 136, 0.3) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div
        className="fixed inset-0 pointer-events-none z-0"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(ellipse 65% 65% at 50% 50%, transparent 35%, var(--surface) 100%)',
        }}
      />

      <section className="relative z-10 flex-1 mx-auto h-full w-full max-w-6xl px-6 pt-52 pb-16 flex flex-col gap-10 items-center">

        <h1
          className="text-center tracking-tight leading-[1.05]"
          style={{ animation: 'fade-up 0.65s cubic-bezier(0.16, 1, 0.3, 1) both' }}
        >
          <span className="block text-accent text-6xl lg:text-7xl font-extrabold">
            {t('home.title')}
          </span>
          <span className="block text-5xl lg:text-6xl font-extrabold text-fg mt-2">
            {t('home.subtitle')}
          </span>
        </h1>

        <div
          className="max-w-3xl w-full backdrop-blur-xs bg-transparent shadow-2xl my-4 hover:shadow-xl transition-shadow duration-300"
          style={{
            animation: 'fade-up 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both',
          }}
        >
          <DropZone onFileSelect={handleFileSelected} />
        </div>

        <ul
          className="flex items-center gap-4 flex-wrap justify-center"
          style={{ animation: 'fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both' }}
        >
          {BADGES.map(({ icon: Icon, key }) => (
            <li
              key={key}
              className="flex items-center gap-2 text-sm font-medium text-fg-muted bg-surface-subtle border border-border-theme px-3 py-2"
            >
              <Icon size={16} className="text-accent shrink-0" />
              {t(key)}
            </li>
          ))}
        </ul>

        <p
          className="text-center text-base text-fg-muted leading-relaxed"
          style={{ animation: 'fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.28s both' }}
        >
          <Trans
            i18nKey="home.description"
            components={{
              logo: <RatureLogo size="lg" />,
              bold: <span className="font-bold text-fg" />,
              accent: <span className="text-accent font-bold" />,
              br: <br />,
            }}
          />
        </p>
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
