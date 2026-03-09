import type { ReactNode } from "react";
import { Toaster } from 'sonner';

import { AnonymizationProvider } from "./AnonymizationProvider.tsx";
import { PdfProcessingProvider } from "./PdfProcessingProvider.tsx";
import { ThemeProvider } from "./ThemeProvider.tsx";

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <AnonymizationProvider>
        <PdfProcessingProvider>
          {children}

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
        </PdfProcessingProvider>
      </AnonymizationProvider>
    </ThemeProvider>
  );
}
