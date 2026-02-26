import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';

interface LoadingPageProps {
  fileName: string
  onComplete: () => void
}

const STEPS = [
  'Chargement du modèle de détection...',
  'Lecture du document...',
  'Analyse de la mise en page...',
  'Détection des entités nommées...',
  'Finalisation...',
];

export function LoadingPage({ fileName, onComplete }: LoadingPageProps) {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const duration = 2800; // ms total
    const interval = 40;
    const steps = duration / interval;
    let current = 0;

    const timer = setInterval(() => {
      current += 1;
      const pct = Math.min((current / steps) * 100, 100);
      setProgress(pct);
      setStepIndex(Math.min(Math.floor(pct / 26), STEPS.length - 1));

      if (pct >= 100) {
        clearInterval(timer);
        setTimeout(onComplete, 300);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-6">
      <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-teal-50 dark:bg-teal-950/30 text-accent">
        <FileText size={36} strokeWidth={1.25} />
        <span className="absolute inset-0 rounded-2xl border-2 border-accent/30 animate-ping" />
      </div>

      <div className="text-center space-y-2 max-w-sm">
        <h2 className="text-xl font-semibold text-fg">Analyse en cours</h2>
        <p className="text-sm text-fg-muted truncate max-w-xs mx-auto" title={fileName}>
          {fileName}
        </p>
      </div>

      <div className="w-full max-w-xs space-y-2">
        <div className="h-1 w-full rounded-full bg-border-theme overflow-hidden">
          <div
            className="h-full rounded-full bg-accent transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-fg-subtle text-center h-4 transition-all duration-300">
          {STEPS[stepIndex]}
        </p>
      </div>
    </div>
  );
}
