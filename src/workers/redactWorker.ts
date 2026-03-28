/// <reference lib="webworker" />
import { PDFDocument } from 'mupdf';
import { Buffer } from 'buffer';

import type { GroupedEntity } from '@/types/index.ts';

declare const self: DedicatedWorkerGlobalScope;

type RedactMessage = {
  type: 'redact';
  jobId: string;
  fileBuffer: ArrayBuffer;
  entities: GroupedEntity[];
  currentPageIndex: number;
};

type RedactResult =
  | { type: 'page_result'; jobId: string; pdfBuffer: Uint8Array; processedPages: number[] }
  | { type: 'result'; jobId: string; pdfBuffer: Uint8Array }
  | { type: 'error'; jobId: string; message: string };

function processPage(pdf: PDFDocument, pageIndex: number, uniqueTexts: string[]) {
  const page = pdf.loadPage(pageIndex);
  const structuredText = page.toStructuredText('preserve-whitespace');
  for (const text of uniqueTexts) {
    const searchResults = structuredText.search(text);
    for (const result of searchResults) {
      const annotation = page.createAnnotation('Redact');
      annotation.setQuadPoints(result);
      annotation.applyRedaction();
    }
  }
}

self.onmessage = async (event: MessageEvent<RedactMessage>) => {
  const { type, jobId, fileBuffer, entities, currentPageIndex } = event.data;
  if (type !== 'redact') return;

  try {
    const buffer = Buffer.from(fileBuffer);
    const pdf = PDFDocument.openDocument(buffer, 'application/pdf') as PDFDocument;

    const uniqueTexts = [
      ...new Set(
        entities
          .filter(e => e.included && e.text.length > 1)
          .map(e => e.text)
      ),
    ];

    const pageCount = pdf.countPages();

    // Phase 1: process the current page first for immediate preview
    processPage(pdf, currentPageIndex, uniqueTexts);
    const partialSave = pdf.saveToBuffer({ garbage: 0, compress: true, clean: false, ascii: false });
    const partialBuffer = new Uint8Array(partialSave.asUint8Array());
    const pageResultMsg: RedactResult = { type: 'page_result', jobId, pdfBuffer: partialBuffer, processedPages: [currentPageIndex] };
    self.postMessage(pageResultMsg, [partialBuffer.buffer]);

    // Phase 2: process all remaining pages
    for (let i = 0; i < pageCount; i++) {
      if (i === currentPageIndex) continue;
      processPage(pdf, i, uniqueTexts);
    }

    const fullSave = pdf.saveToBuffer({ garbage: 4, compress: true, clean: true, ascii: false });
    const fullBuffer = new Uint8Array(fullSave.asUint8Array());
    const resultMsg: RedactResult = { type: 'result', jobId, pdfBuffer: fullBuffer };
    self.postMessage(resultMsg, [fullBuffer.buffer]);
  } catch (err) {
    const msg: RedactResult = { type: 'error', jobId, message: String(err) };
    self.postMessage(msg);
  }
};

self.postMessage({ type: 'ready' });
