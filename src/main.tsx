import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import './index.css';
import './lib/i18n.ts';

import App from './App.tsx';
import { Layout } from './components/layout/Layout.tsx';

const SettingsPage = lazy(() =>
  import('./pages/SettingsPage.tsx').then(m => ({ default: m.SettingsPage }))
);
const AboutPage = lazy(() =>
  import('./pages/AboutPage.tsx').then(m => ({ default: m.AboutPage }))
);
const PrivacyPolicyPage = lazy(() =>
  import('./pages/PrivacyPolicy.tsx').then(m => ({ default: m.PrivacyPolicyPage }))
);

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="*" element={<App />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
);
