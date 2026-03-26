import { useState, useCallback } from 'react';

import { HomePage } from '@/pages/HomePage.tsx';
import { LoadingPage } from '@/pages/LoadingPage.tsx';
import { WorkflowPage } from '@/pages/WorkflowPage.tsx';
import type { AppPage } from '@/types/index.ts';

export default function App() {
  const [page, setPage] = useState<AppPage>('home');

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
        <LoadingPage onComplete={handleLoadingComplete} />
      )}

      {page === 'workflow' && (
        <WorkflowPage
          onBack={handleBack}
        />
      )}
    </>
  );
}
