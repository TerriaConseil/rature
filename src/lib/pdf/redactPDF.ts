import { PDFDocument } from "mupdf";
import { Buffer } from "buffer";

import type { GroupedEntity } from "@/types/index.ts";

export async function redactPDFDocument(
  file: File,
  entities: GroupedEntity[]
): Promise<PDFDocument> {
  // Open a fresh copy — never mutates the original PDFDocument held in context
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const pdf = PDFDocument.openDocument(buffer, "application/pdf") as PDFDocument;

  // Deduplicate entity texts once, upfront
  const uniqueTexts = [
    ...new Set(
      entities
        .filter((e) => e.included && e.text.length > 1)
        .map((e) => e.text)
    ),
  ];

  const pageCount = pdf.countPages();

  for (let i = 0; i < pageCount; i++) {
    const page = pdf.loadPage(i);
    // structuredText.search() is scoped to this single page, so we search
    // every unique text on every page — no cross-page deduplication needed.
    const structuredText = page.toStructuredText("preserve-whitespace");

    for (const text of uniqueTexts) {
      const searchResults = structuredText.search(text);

      for (const result of searchResults) {
        const annotation = page.createAnnotation("Redact");
        annotation.setQuadPoints(result);
        annotation.applyRedaction();
      }
    }
  }

  return pdf;
}
