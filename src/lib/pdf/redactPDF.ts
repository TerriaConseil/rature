import { PDFDocument, PDFPage } from "mupdf";
import { Buffer } from "buffer";

import type { DetectedImage, GroupedEntity, ImageRedactionMethod } from "@/types/index.ts";

const IMAGE_METHOD_MAP: Record<ImageRedactionMethod, number> = {
  none: PDFPage.REDACT_IMAGE_NONE,
  pixels: PDFPage.REDACT_IMAGE_PIXELS,
  remove: PDFPage.REDACT_IMAGE_REMOVE,
};

export async function redactPDFDocument(
  file: File,
  entities: GroupedEntity[],
  images: DetectedImage[] = [],
  imageMethod: ImageRedactionMethod = 'none',
): Promise<PDFDocument> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const pdf = PDFDocument.openDocument(buffer, "application/pdf") as PDFDocument;

  const uniqueTexts = [
    ...new Set(
      entities
        .filter((e) => e.included && e.text.length > 1)
        .map((e) => e.text)
    ),
  ];

  const imageMethodConst = IMAGE_METHOD_MAP[imageMethod] ?? PDFPage.REDACT_IMAGE_NONE;
  const pageCount = pdf.countPages();

  for (let i = 0; i < pageCount; i++) {
    const page = pdf.loadPage(i);
    const structuredText = page.toStructuredText("preserve-whitespace");

    // Text redaction annotations
    for (const text of uniqueTexts) {
      const searchResults = structuredText.search(text);

      for (const result of searchResults) {
        const annotation = page.createAnnotation("Redact");
        annotation.setQuadPoints(result);
      }
    }

    // Image redaction annotations
    if (imageMethodConst !== PDFPage.REDACT_IMAGE_NONE) {
      const pageImages = images.filter(img => img.page === i && img.included);
      for (const img of pageImages) {
        const annotation = page.createAnnotation("Redact");
        annotation.setRect(img.rect);
      }
    }

    // Apply all redactions at once
    page.applyRedactions(true, imageMethodConst);
  }

  return pdf;
}
