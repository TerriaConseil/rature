import { PDFDocument } from "mupdf";
import { createContext } from "react";

import type { DetectedImage } from "@/types/index.ts";

export type PDFProcessingStatus = "idle" | "processing" | "complete" | "error";

export type TextExtract = {
  page: number;
  text: string;
};

interface PdfProcessingContextValue {
  detectedImages: DetectedImage[];
  extractedText: TextExtract[];
  file: File | null;
  pageCount: number;
  pdfDocument: PDFDocument | null;
  processingStatus: PDFProcessingStatus;
  processFile: () => Promise<TextExtract[]>;
  reset: () => void;
  setDetectedImages: (images: DetectedImage[]) => void;
  setFile: (file: File) => void;
}

export const PdfProcessingContext = createContext<PdfProcessingContextValue>({
  detectedImages: [],
  extractedText: [],
  file: null,
  pageCount: 0,
  pdfDocument: null,
  processingStatus: 'idle',
  processFile: () => new Promise(() => {}),
  reset: () => {},
  setDetectedImages: () => {},
  setFile: () => {},
});
