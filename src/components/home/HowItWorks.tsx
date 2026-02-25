import { UploadCloud, ScanEye, Download } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon: UploadCloud,
    title: 'Importez votre PDF',
    description: 'Glissez-déposez ou sélectionnez votre document confidentiel.',
  },
  {
    number: '02',
    icon: ScanEye,
    title: 'Examinez les détections',
    description:
      'Rature détecte automatiquement les noms, dates, adresses et entités sensibles. Revoyez et ajustez les occultations.',
  },
  {
    number: '03',
    icon: Download,
    title: 'Exportez et partagez',
    description:
      "Téléchargez votre PDF anonymisé, prêt à être partagé avec n'importe quel assistant IA.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="mx-auto max-w-300 px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-fg tracking-tight">Comment ça marche</h2>
          <p className="mt-3 text-base text-fg-muted max-w-lg mx-auto">
            Trois étapes simples pour anonymiser vos documents en toute sécurité.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map(({ number, icon: Icon, title, description }) => (
            <div
              key={number}
              className="relative flex flex-col gap-4 rounded-2xl border border-border-theme bg-card p-7 hover:-translate-y-0.5 transition-transform duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-950/30 text-accent">
                  <Icon size={22} strokeWidth={1.75} />
                </div>
                <span className="text-3xl font-bold text-fg-subtle/40 tabular-nums leading-none">
                  {number}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-fg mb-1.5">{title}</h3>
                <p className="text-sm text-fg-muted leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
