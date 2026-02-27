import { useContext } from "react";

import { PdfProcessingContext } from "@/context/pdfProcessing.tsx";

export function usePdfProcessing() {
  return useContext(PdfProcessingContext);
}
