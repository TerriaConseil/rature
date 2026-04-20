import { lazy, Suspense, useCallback } from 'react';
import { Route, Routes, useNavigate } from 'react-router';

import { HomePage } from '@/pages/HomePage.tsx';

const LoadingPage = lazy(() =>
  import('@/pages/LoadingPage.tsx').then(m => ({ default: m.LoadingPage }))
);
const DocumentLayout = lazy(() =>
  import('@/pages/DocumentLayout.tsx').then(m => ({ default: m.DocumentLayout }))
);
const EditionPage = lazy(() =>
  import('@/pages/EditionPage.tsx').then(m => ({ default: m.EditionPage }))
);
const ImageEditionPage = lazy(() =>
  import('@/pages/ImageEditionPage.tsx').then(m => ({ default: m.ImageEditionPage }))
);
const PreviewPage = lazy(() =>
  import('@/pages/PreviewPage.tsx').then(m => ({ default: m.PreviewPage }))
);

export default function App() {
  const navigate = useNavigate();

  const handleFileSelected = useCallback(() => {
    navigate('/processing');
  }, [navigate]);

  const handleLoadingComplete = useCallback(() => {
    navigate('/document/edition', { replace: true });
  }, [navigate]);

  return (
    <Suspense fallback={null}>
      <Routes>
        <Route index element={<HomePage onFileSelect={handleFileSelected} />} />
        <Route path="processing" element={<LoadingPage onComplete={handleLoadingComplete} />} />
        <Route path="document" element={<DocumentLayout />}>
          <Route path="edition" element={<EditionPage />} />
          <Route path="image-edition" element={<ImageEditionPage />} />
          <Route path="preview" element={<PreviewPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
