import { useState, useCallback, useRef, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { type PDFDocument } from 'mupdf';

import { DocumentContext } from '@/context/document.tsx';
import { useAnonymization } from '@/hooks/useAnonymization.ts';
import { usePdfProcessing } from '@/hooks/usePdfProcessing.ts';
import { useRedactWorker } from '@/hooks/useRedactWorker.ts';
import type { ImageRedactionMethod, WorkflowMode } from '@/types/index.ts';

export function DocumentProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { nerEntities: entities } = useAnonymization();
  const { file, pageCount, detectedImages } = usePdfProcessing();
  const { redact } = useRedactWorker();

  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [showExport, setShowExport] = useState(false);
  const [redactedDocument, setRedactedDocument] = useState<PDFDocument | null>(null);
  const [pendingPages, setPendingPages] = useState<Set<number>>(new Set());
  const [isRedacting, setIsRedacting] = useState(false);
  const [imageMethod, setImageMethod] = useState<ImageRedactionMethod>('pixels');

  const entitiesRef = useRef(entities);
  const currentPageRef = useRef(currentPage);
  const detectedImagesRef = useRef(detectedImages);
  const imageMethodRef = useRef(imageMethod);

  entitiesRef.current = entities;
  currentPageRef.current = currentPage;
  detectedImagesRef.current = detectedImages;
  imageMethodRef.current = imageMethod;

  const handleModeChange = useCallback(async (newMode: WorkflowMode) => {
    if (newMode === 'preview') {
      if (!file) return;
      setIsRedacting(true);
      navigate('/document/preview', { replace: true });
      setPendingPages(new Set(Array.from({ length: pageCount }, (_, i) => i)));
      try {
        const doc = await redact(
          file,
          entitiesRef.current,
          currentPageRef.current - 1,
          (partialDoc, processedPages) => {
            setRedactedDocument(partialDoc);
            setPendingPages(prev => {
              const next = new Set(prev);
              for (const p of processedPages) next.delete(p);
              return next;
            });
            setIsRedacting(false);
          },
          detectedImagesRef.current,
          imageMethodRef.current,
        );
        setRedactedDocument(doc);
        setPendingPages(new Set());
      } catch (err) {
        console.error('Redaction failed:', err);
        navigate('/document/edition', { replace: true });
        setIsRedacting(false);
        setPendingPages(new Set());
      }
    } else if (newMode === 'image-edition') {
      setRedactedDocument(null);
      setPendingPages(new Set());
      navigate('/document/image-edition', { replace: true });
    } else {
      setRedactedDocument(null);
      setPendingPages(new Set());
      navigate('/document/edition', { replace: true });
    }
  }, [file, navigate, pageCount, redact]);

  return (
    <DocumentContext.Provider value={{
      currentPage,
      setCurrentPage,
      zoom,
      setZoom,
      showExport,
      setShowExport,
      redactedDocument,
      setRedactedDocument,
      pendingPages,
      setPendingPages,
      isRedacting,
      setIsRedacting,
      imageMethod,
      setImageMethod,
      handleModeChange,
    }}>
      {children}
    </DocumentContext.Provider>
  );
}
