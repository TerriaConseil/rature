import { PDFDocument } from "mupdf";
import { createContext } from "react";

export type PDFProcessingStatus = "idle" | "processing" | "complete" | "error";

export type TextExtract = {
  page: number;
  text: string;
};

interface PdfProcessingContextValue {
  extractedText: TextExtract[];
  file: File | null;
  pdfDocument: PDFDocument | null;
  processingStatus: PDFProcessingStatus;
  processFile: (file: File) => Promise<TextExtract[]>;
  reset: () => void;
}

export const PdfProcessingContext = createContext<PdfProcessingContextValue>({
  extractedText: [],
  file: null,
  pdfDocument: null,
  processingStatus: 'idle',
  processFile: () => new Promise(() => {}),
  reset: () => {},
});
