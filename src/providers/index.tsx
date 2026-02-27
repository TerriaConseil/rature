import type { ReactNode } from "react";
import { ThemeProvider } from "./ThemeProvider.tsx";
import { AnonymizationProvider } from "./AnonymizationProvider.tsx";
import { PdfProcessingProvider } from "./PdfProcessingProvider.tsx";

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <AnonymizationProvider>
        <PdfProcessingProvider>
          {children}
        </PdfProcessingProvider>
      </AnonymizationProvider>
    </ThemeProvider>
  );
}
