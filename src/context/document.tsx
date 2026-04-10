import { createContext } from 'react';
import type { PDFDocument } from 'mupdf';
import type { ImageRedactionMethod, WorkflowMode } from '@/types/index.ts';

export interface DocumentContextValue {
  currentPage: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  zoom: number;
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  showExport: boolean;
  setShowExport: (show: boolean) => void;
  redactedDocument: PDFDocument | null;
  setRedactedDocument: (doc: PDFDocument | null) => void;
  pendingPages: Set<number>;
  setPendingPages: (pages: Set<number> | ((prev: Set<number>) => Set<number>)) => void;
  isRedacting: boolean;
  setIsRedacting: (v: boolean | ((prev: boolean) => boolean)) => void;
  imageMethod: ImageRedactionMethod;
  setImageMethod: (method: ImageRedactionMethod) => void;
  handleModeChange: (mode: WorkflowMode) => Promise<void>;
}

export const DocumentContext = createContext<DocumentContextValue | null>(null);
