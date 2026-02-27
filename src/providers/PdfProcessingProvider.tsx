import type { PDFDocument } from "mupdf";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

import { PdfProcessingContext, type TextExtract, type PDFProcessingStatus } from "@/context/pdfProcessing.tsx";
import uploadPDF from "@/lib/uploadPDF.tsx";

type PdfProcessingProviderProps = {
  children: ReactNode;
};

export function PdfProcessingProvider({ children }: PdfProcessingProviderProps) {
  const [status, setStatus] = useState<PDFProcessingStatus>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pdfDocument, setPdfDocument] = useState<PDFDocument | null>(null);
  const [extractedText, setExtractedText] = useState<TextExtract[]>([]);

  const processFile = async () => {
    if (!file) {
      throw new Error('You must set the file first');
    }

    setStatus("processing");

    try {
      const result = await uploadPDF(file);

      const extracted = result.pages.map(({ pageNumber, text }) => ({
        page: pageNumber,
        text,
      }));

      setPageCount(result.pageCount);
      setPdfDocument(result.document);
      setExtractedText(extracted || []);
      setStatus("complete");

      return extracted;
    } catch (error) {
      setStatus("error");
      toast.error(error instanceof Error ? error.message : "Failed to process PDF");
      console.error("Processing error:", error);

      return [];
    }
  };

  const reset = () => {
    setStatus('idle');
    setFile(null);
    setPdfDocument(null);
    setExtractedText([]);
  };

  return (
    <PdfProcessingContext value={{
      file,
      pdfDocument,
      pageCount,
      processingStatus: status,
      extractedText,
      processFile,
      reset,
      setFile,
    }}>
      {children}
    </PdfProcessingContext>
  );
}
