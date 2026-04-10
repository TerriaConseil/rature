import { useCallback } from 'react';
import { Route, Routes, useNavigate } from 'react-router';

import { HomePage } from '@/pages/HomePage.tsx';
import { LoadingPage } from '@/pages/LoadingPage.tsx';
import { DocumentLayout } from '@/pages/DocumentLayout.tsx';
import { EditionPage } from '@/pages/EditionPage.tsx';
import { ImageEditionPage } from '@/pages/ImageEditionPage.tsx';
import { PreviewPage } from '@/pages/PreviewPage.tsx';

export default function App() {
  const navigate = useNavigate();

  const handleFileSelected = useCallback(() => {
    navigate('/processing');
  }, [navigate]);

  const handleLoadingComplete = useCallback(() => {
    navigate('/document/edition', { replace: true });
  }, [navigate]);

  return (
    <Routes>
      <Route index element={<HomePage onFileSelect={handleFileSelected} />} />
      <Route path="processing" element={<LoadingPage onComplete={handleLoadingComplete} />} />
      <Route path="document" element={<DocumentLayout />}>
        <Route path="edition" element={<EditionPage />} />
        <Route path="image-edition" element={<ImageEditionPage />} />
        <Route path="preview" element={<PreviewPage />} />
      </Route>
    </Routes>
  );
}
