import { useCallback } from 'react';
import { Route, Routes, useNavigate } from 'react-router';

import { HomePage } from '@/pages/HomePage.tsx';
import { LoadingPage } from '@/pages/LoadingPage.tsx';
import { WorkflowPage } from '@/pages/WorkflowPage.tsx';

export default function App() {
  const navigate = useNavigate();

  const handleFileSelected = useCallback(() => {
    navigate('/processing');
  }, [navigate]);

  const handleLoadingComplete = useCallback(() => {
    navigate('/document/edition', { replace: true });
  }, [navigate]);

  const handleBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return (
    <Routes>
      <Route index element={<HomePage onFileSelect={handleFileSelected} />} />
      <Route path="processing" element={<LoadingPage onComplete={handleLoadingComplete} />} />
      <Route path="document/:mode" element={<WorkflowPage onBack={handleBack} />} />
    </Routes>
  );
}
