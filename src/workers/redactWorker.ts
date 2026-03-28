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
};

type RedactResult =
  | { type: 'result'; jobId: string; pdfBuffer: Uint8Array }
  | { type: 'error'; jobId: string; message: string };

self.onmessage = async (event: MessageEvent<RedactMessage>) => {
  const { type, jobId, fileBuffer, entities } = event.data;
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
    for (let i = 0; i < pageCount; i++) {
      const page = pdf.loadPage(i);
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

    const saveBuffer = pdf.saveToBuffer({ garbage: 4, compress: true, clean: true, ascii: false });
    const pdfBuffer = new Uint8Array(saveBuffer.asUint8Array());
    const msg: RedactResult = { type: 'result', jobId, pdfBuffer };
    self.postMessage(msg, [pdfBuffer.buffer]);
  } catch (err) {
    const msg: RedactResult = { type: 'error', jobId, message: String(err) };
    self.postMessage(msg);
  }
};

self.postMessage({ type: 'ready' });
