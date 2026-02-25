import { useRef } from 'react';
import { Navbar } from '@/components/Navbar.tsx';
import { DropZone } from '@/components/home/DropZone.tsx';
import { TrustBanner } from '@/components/home/TrustBanner.tsx';
import { HowItWorks } from '@/components/home/HowItWorks.tsx';
import { Features } from '@/components/home/Features.tsx';
import { Footer } from '@/components/home/Footer.tsx';

interface HomePageProps {
  onFileSelect: (file: File) => void
}

export function HomePage({ onFileSelect }: HomePageProps) {
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const scrollToDropZone = () => {
    dropZoneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="flex flex-col min-h-full">
      <Navbar onUploadClick={scrollToDropZone} />

      {/* Hero */}
      <section className="mx-auto w-full max-w-300 px-6 pt-20 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left — headline */}
        <div className="flex flex-col gap-6">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700 dark:border-teal-800 dark:bg-teal-950/30 dark:text-teal-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-600" />
            </span>
            100 % local — rien ne quitte votre appareil
          </div>

          <h1 className="text-5xl lg:text-6xl font-bold text-fg tracking-tight leading-[1.1]">
            Anonymisez vos PDFs.{' '}
            <span className="text-accent">Directement dans votre navigateur.</span>
          </h1>

          <p className="text-lg text-fg-muted leading-relaxed max-w-lg">
            Rature détecte et occulte les données sensibles de vos documents — 100 % localement.
            Rien ne quitte jamais votre appareil. Partagez en toute confiance avec n'importe quel
            assistant IA.
          </p>

          <div ref={dropZoneRef} />
        </div>

        {/* Right — drop zone */}
        <div className="flex flex-col gap-4">
          <div
            className="rounded-2xl border border-border-theme bg-card p-6"
            style={{ boxShadow: '0 4px 24px 0 rgb(0 0 0 / 0.06)' }}
          >
            <p className="text-xs font-medium text-fg-muted uppercase tracking-wider mb-4">
              Importer un document
            </p>
            <DropZone onFileSelect={onFileSelect} />
          </div>

          <TrustBanner />
        </div>
      </section>

      {/* Sections */}
      <HowItWorks />
      <Features />

      {/* Mobile warning */}
      <div className="fixed inset-0 z-100 flex items-center justify-center bg-surface p-8 md:hidden">
        <div className="text-center max-w-sm">
          <p className="text-3xl mb-4">🖥️</p>
          <h2 className="text-xl font-bold text-fg mb-2">Version desktop recommandée</h2>
          <p className="text-sm text-fg-muted">
            Rature est optimisé pour une utilisation sur écran large. Veuillez accéder à l'application
            depuis un ordinateur.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
