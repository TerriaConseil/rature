import { BookOpen, CheckCircle, Cpu, ExternalLink, HardDriveDownload, ScanEye } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useNERWorker } from '@/hooks/useNERWorker.ts';
import { useAnonymization } from '@/hooks/useAnonymization.ts';
import { CUSTOM_PAGE_SPLIT_TOKEN, NER_MODELS, type NERModel } from '@/models/utils.ts';
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

const STEP_ICONS = [Cpu, BookOpen, ScanEye, CheckCircle];

export function LoadingPage({ modelName, onComplete }: LoadingPageProps) {
  const { downloadProgress, processingProgress, modelTokens, status: workerStatus, error, initialize, processText, terminate } = useNERWorker();
  const { setModelTokens, setNerEntities } = useAnonymization();
  const { file, pageCount, processingStatus: pdfProcessingStatus, processFile } = usePdfProcessing();

  const [progress, setProgress] = useState(10);
  const [stepIndex, setStepIndex] = useState(0);
  const [showSubPanel, setShowSubPanel] = useState(false);
  const [iconStep, setIconStep] = useState(0);
  const [iconPhase, setIconPhase] = useState<'enter' | 'exit'>('enter');

  const handleShowSubPanel = useCallback(() => {
    if (!showSubPanel && downloadProgress && downloadProgress.percent < 100) {
      setShowSubPanel(true);
    }
  }, [downloadProgress, showSubPanel]);

  const updateStep = useCallback((step: number) => {
    if (showSubPanel && step !== 0) {
      setShowSubPanel(false);
    }

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
  }, [showSubPanel]);

  const finalize = useCallback(() => {
    updateStep(3);

    setTimeout(() => setProgress(100), 500);
    setTimeout(onComplete, 1000);
  }, [onComplete, updateStep]);

  const analyzeDocument = useCallback(async (text: string) => {
    setTimeout(() => updateStep(2), 500);

    const { entities } = await processText(text);

    const labeledEntities = entities.filter((entity) => entity.type !== 'O');

    setNerEntities(labeledEntities);
    setModelTokens(modelTokens);

    setTimeout(() => finalize(), 500);
  }, [finalize, modelTokens, processText, setModelTokens, setNerEntities, updateStep]);

  const processDocument = useCallback(async () => {
    if (pdfProcessingStatus !== 'idle') return;

    updateStep(1);

    const text = await processFile();

    analyzeDocument(text.map((extract) => extract.text.replaceAll(/\n+/g, ' ')).join(CUSTOM_PAGE_SPLIT_TOKEN));
  }, [analyzeDocument, pdfProcessingStatus, processFile, updateStep]);

  const workerMemo = useMemo(() => initialize(modelName), [initialize, modelName]);

  useEffect(() => {
    if (workerStatus !== 'ready') return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    processDocument();
  }, [pdfProcessingStatus, processDocument, stepIndex, workerStatus]);

  useEffect(() => {
    return () => {
      if (!!workerMemo && workerStatus !== 'idle' && (!!error || progress === 100)) {
        terminate();
      }
    };
  }, [error, progress, terminate, workerMemo, workerStatus]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (downloadProgress) handleShowSubPanel();
  }, [downloadProgress, handleShowSubPanel]);

  useEffect(() => {
    const timer = setTimeout(handleShowSubPanel, 750);
    return () => clearTimeout(timer);
  }, [handleShowSubPanel, stepIndex]);

  useEffect(() => {
    if (stepIndex === iconStep) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIconPhase('exit');
    const timer = setTimeout(() => {
      setIconStep(stepIndex);
      setIconPhase('enter');
    }, 200);
    return () => clearTimeout(timer);
  }, [stepIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!file) {
    return <div>No file selected!</div>;
  }

  const StepIcon = STEP_ICONS[iconStep];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-10 px-6">
      <div className="relative flex items-center justify-center">
        <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-teal-50 dark:bg-teal-950/30 text-accent">
          <div
            key={iconPhase === 'exit' ? 'icon-exit' : iconStep}
            className={
              iconPhase === 'exit'
                ? 'animate-out fade-out zoom-out-90 slide-out-to-top-2 duration-200 fill-mode-forwards'
                : 'animate-in fade-in zoom-in-90 slide-in-from-bottom-2 duration-300'
            }
          >
            <div style={{ animation: 'icon-spin-pulse 3s ease-in-out infinite' }}>
              <StepIcon size={36} strokeWidth={1.25} />
            </div>
          </div>
        </div>
      </div>

      <div className="text-center space-y-2 max-w-sm">
        <h2 className="text-xl font-semibold text-fg">Analyse en cours</h2>
        <p
          className="text-sm text-fg-muted truncate max-w-xs mx-auto animate-in fade-in duration-500"
          title={file.name}
        >
          {file.name}
        </p>
      </div>

      <div className="w-full max-w-xs space-y-3">
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={[
                'block rounded-full transition-all duration-300',
                i < stepIndex
                  ? 'w-2 h-2 bg-accent scale-110'
                  : i === stepIndex
                    ? 'w-2 h-2 bg-accent animate-pulse'
                    : 'w-1.5 h-1.5 bg-border-theme',
              ].join(' ')}
            />
          ))}
        </div>

        <div className="h-1.5 w-full rounded-full bg-border-theme overflow-hidden">
          <div
            className="relative h-full rounded-full bg-linear-to-r from-teal-600 to-teal-400 transition-all duration-300 ease-out overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            <span className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
          </div>
        </div>

        <p
          key={stepIndex}
          className="text-xs text-fg-subtle text-center h-4 animate-in fade-in slide-in-from-bottom-1 duration-300"
        >
          {STEPS[stepIndex]}
        </p>
      </div>

      {stepIndex === 2 && pageCount > 1 && (
        <div className="w-full max-w-xs animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="rounded-xl border border-border-theme bg-surface-subtle p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-fg-muted">
              <ScanEye size={12} strokeWidth={1.5} />
              <span className="text-xs">Analyse des entités</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-fg-muted">Page</span>
              <span
                className="text-sm font-medium text-fg tabular-nums animate-in fade-in duration-200"
              >
                {processingProgress
                  ? Math.ceil((processingProgress.chunksProcessed / processingProgress.totalChunks) * processingProgress.totalPages)
                  : 1
                } / {pageCount}
              </span>
            </div>

            <div className="h-1 w-full rounded-full bg-border-theme overflow-hidden">
              <div
                className="h-full rounded-full bg-linear-to-r from-teal-600 to-teal-400 transition-all duration-200 ease-out"
                style={{ width: `${processingProgress ? Math.round((processingProgress.chunksProcessed / processingProgress.totalChunks) * 100) : 0}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-fg-subtle">
                ~{processingProgress ? (processingProgress.chunksProcessed * 150).toLocaleString('fr-FR') : '0'} mots analysés
              </span>
              <span className="text-xs text-accent font-medium tabular-nums">
                {processingProgress ? Math.round((processingProgress.chunksProcessed / processingProgress.totalChunks) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      )}

      {showSubPanel && stepIndex === 0 && (
        <div className="w-full max-w-xs animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="rounded-xl border border-border-theme bg-surface-subtle p-3 space-y-2">
            {downloadProgress !== null ? (
              <>
                <div className="flex items-center gap-1.5 text-fg-muted">
                  <HardDriveDownload size={12} strokeWidth={1.5} />
                  <span className="text-xs">Téléchargement du modèle</span>
                </div>

                <p className="flex items-center gap-2 text-xs font-mono text-fg-subtle" title={downloadProgress.modelName}>
                  <span>{NER_MODELS[downloadProgress.modelName].label}</span>
                  <a href={NER_MODELS[downloadProgress.modelName].url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={12} />
                  </a>
                </p>

                <div className="h-1 w-full rounded-full bg-border-theme overflow-hidden">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-teal-600 to-teal-400 transition-all duration-200 ease-out"
                    style={{ width: `${downloadProgress.percent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-fg-subtle">
                    {(downloadProgress.loaded / 1024 / 1024).toFixed(1)} Mo / {(downloadProgress.total / 1024 / 1024).toFixed(1)} Mo
                  </span>
                  <span className="text-xs text-accent font-medium tabular-nums">{downloadProgress.percent}%</span>
                </div>

                <p className="text-[10px] text-fg-subtle/60">
                  Mis en cache après le premier chargement
                </p>
              </>
            ) : (
              <div className="flex items-center gap-2 text-fg-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shrink-0" />
                <span className="text-xs">Chargement depuis le cache...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
