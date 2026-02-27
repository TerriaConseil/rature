import { FileText } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useNERWorker } from '@/hooks/useNERWorker.ts';
import { useAnonymization } from '@/hooks/useAnonymization.ts';
import type { NERModel } from '@/models/utils.ts';
import { usePdfProcessing } from '@/hooks/usePdfProcessing.ts';

interface LoadingPageProps {
  modelName: NERModel;
  onComplete: () => void;
}

const STEPS = [
  'Chargement du modèle de détection...',
  'Lecture du document...',
  'Détection des entités nommées...',
  'Finalisation...',
];

export function LoadingPage({ modelName, onComplete }: LoadingPageProps) {
  const { status: workerStatus, error, initialize, processText, terminate } = useNERWorker();
  const { setNerEntities } = useAnonymization();
  const { file, processingStatus: pdfProcessingStatus, processFile } = usePdfProcessing();

  const [progress, setProgress] = useState(10);
  const [stepIndex, setStepIndex] = useState(0);

  const updateStep = (step: number) => {
    setStepIndex(step);

    if (step === 1) {
      setProgress(30);
    }

    if (step === 2) {
      setProgress(50);
    }

    if (step === 3) {
      setProgress(90);
    }
  };

  const finalize = useCallback(() => {
    updateStep(3);

    setTimeout(() => setProgress(100), 1500);
    setTimeout(onComplete, 2000);
  }, [onComplete]);

  const analyzeDocument = useCallback(async (text: string) => {
    setTimeout(() => updateStep(2), 500);

    const { entities } = await processText(text);

    setNerEntities(entities);

    setTimeout(() => finalize(), 750);
  }, [finalize, processText, setNerEntities]);

  const processDocument = useCallback(async () => {
    if (pdfProcessingStatus !== 'idle') return;

    updateStep(1);

    const text = await processFile();

    analyzeDocument(text.map((extract) => extract.text).join('\n'));
  }, [analyzeDocument, pdfProcessingStatus, processFile]);

  const workerMemo = useMemo(() => initialize(modelName), [initialize, modelName]);

  useEffect(() => {
    if (workerStatus !== 'ready') return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    processDocument();
  }, [pdfProcessingStatus, processDocument, stepIndex, workerStatus]);

  useEffect(() => {
    return () => {
      if (!!workerMemo && workerStatus !== 'idle' && (!!error || progress === 100)) {
        console.log('exterminate', workerStatus);
        terminate();
      }
    };
  }, [error, progress, terminate, workerMemo, workerStatus]);

  if (!file) {
    return <div>No file selected!</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-6">
      <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-teal-50 dark:bg-teal-950/30 text-accent">
        <FileText size={36} strokeWidth={1.25} />
        <span className="absolute inset-0 rounded-2xl border-2 border-accent/30 animate-ping" />
      </div>

      <div className="text-center space-y-2 max-w-sm">
        <h2 className="text-xl font-semibold text-fg">Analyse en cours</h2>
        <p className="text-sm text-fg-muted truncate max-w-xs mx-auto" title={file.name}>
          {file.name}
        </p>
      </div>

      <div className="w-full max-w-xs space-y-2">
        <div className="h-1 w-full rounded-full bg-border-theme overflow-hidden">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300 ease-out"
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
