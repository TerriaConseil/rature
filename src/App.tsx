import { useState, useCallback } from 'react';
import { Toaster } from 'sonner';

import { NER_MODELS_NAMES, type NERModel } from '@/models/utils.ts';
import { HomePage } from '@/pages/HomePage.tsx';
import { LoadingPage } from '@/pages/LoadingPage.tsx';
import { WorkflowPage } from '@/pages/WorkflowPage.tsx';
import Providers from '@/providers/index.tsx';
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
    <Providers>
      <div className="flex flex-col min-h-full text-fg antialiased bg-linear-to-b from-gray-200 to-surface dark:from-surface dark:to-gray-900">
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
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--card)',
            color: 'var(--fg)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
          },
        }}
      />
    </Providers>
  );
}
