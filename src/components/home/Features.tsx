import { Globe, Brain, Tag, FileOutput, Palette } from 'lucide-react';

const FEATURES = [
  {
    icon: Globe,
    title: '100 % dans le navigateur',
    description: 'Aucun serveur, aucun cloud. Vos documents ne quittent jamais votre appareil.',
  },
  {
    icon: Brain,
    title: 'Détection par IA',
    description: "Reconnaissance d'entités nommées (NER) via WASM et WebGPU, directement dans le navigateur.",
  },
  {
    icon: Tag,
    title: 'Entités multiples',
    description: 'Noms, dates, adresses, identifiants et motifs personnalisés.',
  },
  {
    icon: FileOutput,
    title: 'PDF en entrée, PDF en sortie',
    description: 'La mise en page est préservée. Exportez un PDF propre prêt à partager.',
  },
  {
    icon: Palette,
    title: 'Mode clair & sombre',
    description: 'Interface adaptée à vos préférences, sans compromis sur la lisibilité.',
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-surface-subtle">
      <div className="mx-auto max-w-300 px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-fg tracking-tight">Fonctionnalités</h2>
          <p className="mt-3 text-base text-fg-muted max-w-lg mx-auto">
            Conçu pour les professionnels du droit et de la conformité.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex gap-4 rounded-2xl border border-border-theme bg-card p-6 hover:-translate-y-0.5 transition-transform duration-200"
            >
              <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-xl bg-teal-50 dark:bg-teal-950/30 text-accent mt-0.5">
                <Icon size={20} strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="font-semibold text-fg mb-1">{title}</h3>
                <p className="text-sm text-fg-muted leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
