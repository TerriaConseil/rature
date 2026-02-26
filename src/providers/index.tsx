import type { ReactNode } from "react";
import { ThemeProvider } from "./ThemeProvider.tsx";
import { AnonymizationProvider } from "./AnonymizationProvider.tsx";

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <AnonymizationProvider>
        {children}
      </AnonymizationProvider>
    </ThemeProvider>
  );
}
