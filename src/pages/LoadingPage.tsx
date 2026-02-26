import { FileText } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { useNERWorker } from '@/hooks/useNERWorker.ts';
import { useAnonymization } from '@/hooks/useAnonymization.ts';
import type { NERModel } from '@/models/utils.ts';

interface LoadingPageProps {
  fileName: string;
  modelName: NERModel;
  onComplete: () => void;
}

const STEPS = [
  'Chargement du modèle de détection...',
  'Lecture du document...',
  'Détection des entités nommées...',
  'Finalisation...',
];

export function LoadingPage({ fileName, modelName, onComplete }: LoadingPageProps) {
  const { status, initialize, processText, terminate } = useNERWorker();
  const { setNerEntities } = useAnonymization();
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  const finalize = useCallback(() => {
    setTimeout(onComplete, 2000);
  }, [onComplete]);

  const analyzeDocument = useCallback(async (text: string) => {
    const { entities } = await processText(text);

    setNerEntities(entities);
    setProgress(90);
    setStepIndex(3);
    finalize();
  }, [finalize, processText, setNerEntities]);

  const processFile = useCallback(() => {
    const text = "Bonjour je m'appelle Julien KILO.";

    setTimeout(() => {
      setProgress(50);
      setStepIndex(2);

      analyzeDocument(text);
    }, 2000);
  }, [analyzeDocument]);

  useEffect(() => {
    if (progress !== 0 || status !== 'idle') return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgress(10);

    initialize(modelName);

    return () => {
      if (status !== 'idle') {
        terminate();
      }
    };
  }, [initialize, modelName, progress, status, terminate]);

  useEffect(() => {
    if (progress !== 10 || status !== 'ready') return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgress(30);
    setStepIndex(1);

    processFile();
  }, [processFile, progress, status]);

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
