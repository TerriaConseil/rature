import { Navbar } from '@/components/Navbar.tsx';
import { DropZone } from '@/components/home/DropZone.tsx';
import { Footer } from '@/components/home/Footer.tsx';

interface HomePageProps {
  onFileSelect: (file: File) => void
}

export function HomePage({ onFileSelect }: HomePageProps) {
  return (
    <div className="flex flex-col justify-between flex-1 h-full">
      <Navbar />

      <section className="flex-1 mx-auto h-full w-full max-w-300 px-6 pt-56 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="flex flex-col gap-6">
          <h1 className="text-5xl lg:text-6xl font-extrabold text-fg tracking-tight leading-[1.1]">
            Anonymisez vos PDFs directement dans votre{' '}
            <span className="text-accent">navigateur</span>
          </h1>

          <p className="text-lg text-fg-muted leading-relaxed max-w-lg">
            Rature détecte et occulte les données sensibles (noms, adresses, téléphone, etc.) de vos documents sans
            qu'ils ne quittent votre appareil. Partagez vos documents anonymisés en toute confiance
            avec n'importe quel assistant IA.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div
            className="rounded-2xl border border-border-theme bg-card p-6"
            style={{ boxShadow: '0 4px 24px 0 rgb(0 0 0 / 0.06)' }}
          >
            <DropZone onFileSelect={onFileSelect} />
          </div>
        </div>
      </section>

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
