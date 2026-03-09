import { useState, useCallback } from 'react';

import { NER_MODELS_NAMES, type NERModel } from '@/models/utils.ts';
import { HomePage } from '@/pages/HomePage.tsx';
import { LoadingPage } from '@/pages/LoadingPage.tsx';
import { WorkflowPage } from '@/pages/WorkflowPage.tsx';
import type { AppPage } from '@/types/index.ts';

export default function App() {
  const [page, setPage] = useState<AppPage>('home');
  const [modelName] = useState<NERModel>(NER_MODELS_NAMES[0]);

  const handleFileSelected = useCallback(() => {
    setPage('loading');
  }, []);

  const handleLoadingComplete = useCallback(() => {
    setPage('workflow');
  }, []);

  const handleBack = useCallback(() => {
    setPage('home');
  }, []);

  return (
    <>
      {page === 'home' && (
        <HomePage onFileSelect={handleFileSelected} />
      )}

      {page === 'loading' && (
        <LoadingPage
          modelName={modelName}
          onComplete={handleLoadingComplete}
        />
      )}

      {page === 'workflow' && (
        <WorkflowPage
          onBack={handleBack}
        />
      )}
    </>
  );
}
