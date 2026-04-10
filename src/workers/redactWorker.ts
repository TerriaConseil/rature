/// <reference lib="webworker" />
import { PDFDocument, PDFPage, type Quad } from 'mupdf';
import { Buffer } from 'buffer';

import type { DetectedImage, GroupedEntity, ImageRedactionMethod } from '@/types/index.ts';

declare const self: DedicatedWorkerGlobalScope;

type RedactMessage = {
  type: 'redact';
  jobId: string;
  fileBuffer: ArrayBuffer;
  entities: GroupedEntity[];
  images: DetectedImage[];
  imageMethod: ImageRedactionMethod;
  currentPageIndex: number;
};

type RedactResult =
  | { type: 'page_result'; jobId: string; pdfBuffer: Uint8Array; processedPages: number[] }
  | { type: 'result'; jobId: string; pdfBuffer: Uint8Array }
  | { type: 'error'; jobId: string; message: string };

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface CharEntry {
  char: string;
  quad: Quad | null; // null for synthetic chars (\n)
}

function extractPageChars(structuredText: ReturnType<ReturnType<PDFDocument['loadPage']>['toStructuredText']>): CharEntry[] {
  const chars: CharEntry[] = [];
  structuredText.walk({
    onChar(c, _origin, _font, _size, quad) {
      chars.push({ char: c, quad });
    },
    endLine() {
      chars.push({ char: '\n', quad: null });
    },
  });
  return chars;
}

function buildRedactQuads(chars: CharEntry[]): Quad[] {
  const quads: Quad[] = [];
  let seg: Quad[] = [];
  const flush = () => {
    if (!seg.length) return;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const q of seg) {
      for (let i = 0; i < 8; i += 2) { x0 = Math.min(x0, q[i]); x1 = Math.max(x1, q[i]); }
      for (let i = 1; i < 8; i += 2) { y0 = Math.min(y0, q[i]); y1 = Math.max(y1, q[i]); }
    }
    quads.push([x0, y0, x1, y0, x0, y1, x1, y1] as Quad);
    seg = [];
  };
  for (const c of chars) {
    if (c.quad) seg.push(c.quad);
    else flush();
  }
  flush();
  return quads;
}

const IMAGE_METHOD_MAP: Record<ImageRedactionMethod, number> = {
  none: PDFPage.REDACT_IMAGE_NONE,
  pixels: PDFPage.REDACT_IMAGE_PIXELS,
  remove: PDFPage.REDACT_IMAGE_REMOVE,
};

function processPage(
  pdf: PDFDocument,
  pageIndex: number,
  uniqueTexts: string[],
  pageImages: DetectedImage[],
  imageMethodConst: number,
) {
  const page = pdf.loadPage(pageIndex);
  const structuredText = page.toStructuredText('preserve-whitespace');

  // --- Text redaction annotations ---
  let chars: CharEntry[] | null = null;
  try {
    chars = extractPageChars(structuredText);
  } catch {
    // walk() failed — fall back to MuPDF's unfiltered search
  }

  if (!chars) {
    for (const text of uniqueTexts) {
      for (const result of structuredText.search(text)) {
        const annotation = page.createAnnotation('Redact');
        annotation.setQuadPoints(result);
      }
    }
  } else {
    const flatText = chars.map(c => c.char).join('');

    for (const text of uniqueTexts) {
      const regex = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegex(text)}(?![\\p{L}\\p{N}])`, 'giu');
      let match;
      while ((match = regex.exec(flatText)) !== null) {
        const matchChars = chars.slice(match.index, match.index + match[0].length);
        const quads = buildRedactQuads(matchChars);
        if (!quads.length) continue;
        const annotation = page.createAnnotation('Redact');
        annotation.setQuadPoints(quads);
      }
    }
  }

  // Pass 1: apply text redactions with black boxes, leaving images untouched
  page.applyRedactions(true, PDFPage.REDACT_IMAGE_NONE);

  // Pass 2: apply image redactions separately
  // black_boxes=false for REMOVE so the image disappears cleanly without leaving a black rectangle
  if (imageMethodConst !== PDFPage.REDACT_IMAGE_NONE) {
    for (const img of pageImages) {
      if (!img.included) continue;
      const annotation = page.createAnnotation('Redact');
      annotation.setRect(img.rect);
    }
    const imageBlackBoxes = imageMethodConst !== PDFPage.REDACT_IMAGE_REMOVE;
    page.applyRedactions(imageBlackBoxes, imageMethodConst);
  }
}

self.onmessage = async (event: MessageEvent<RedactMessage>) => {
  const { type, jobId, fileBuffer, entities, images, imageMethod, currentPageIndex } = event.data;
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

    const imageMethodConst = IMAGE_METHOD_MAP[imageMethod] ?? PDFPage.REDACT_IMAGE_NONE;

    const pageCount = pdf.countPages();

    // Phase 1: process the current page first for immediate preview
    const currentPageImages = images.filter(img => img.page === currentPageIndex);
    processPage(pdf, currentPageIndex, uniqueTexts, currentPageImages, imageMethodConst);
    const partialSave = pdf.saveToBuffer({ garbage: 0, compress: true, clean: false, ascii: false });
    const partialBuffer = new Uint8Array(partialSave.asUint8Array());
    const pageResultMsg: RedactResult = { type: 'page_result', jobId, pdfBuffer: partialBuffer, processedPages: [currentPageIndex] };
    self.postMessage(pageResultMsg, [partialBuffer.buffer]);

    // Phase 2: process all remaining pages
    for (let i = 0; i < pageCount; i++) {
      if (i === currentPageIndex) continue;
      const pageImages = images.filter(img => img.page === i);
      processPage(pdf, i, uniqueTexts, pageImages, imageMethodConst);
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
