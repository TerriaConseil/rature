import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import './index.css';
import './lib/i18n.ts';

import App from './App.tsx';
import { Layout } from './components/layout/Layout.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { PrivacyPolicyPage } from './pages/PrivacyPolicy.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="*" element={<App />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
