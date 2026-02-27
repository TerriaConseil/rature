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
  pageCount: number;
  pdfDocument: PDFDocument | null;
  processingStatus: PDFProcessingStatus;
  processFile: () => Promise<TextExtract[]>;
  reset: () => void;
  setFile: (file: File) => void;
}

export const PdfProcessingContext = createContext<PdfProcessingContextValue>({
  extractedText: [],
  file: null,
  pageCount: 0,
  pdfDocument: null,
  processingStatus: 'idle',
  processFile: () => new Promise(() => {}),
  reset: () => {},
  setFile: () => {},
});
