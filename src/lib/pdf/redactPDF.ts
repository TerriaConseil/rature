import { PDFDocument } from "mupdf";
import { Buffer } from "buffer";

import type { GroupedEntity } from "@/types/index.ts";

export async function redactPDFDocument(
  file: File,
  entities: GroupedEntity[]
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

  const pageCount = pdf.countPages();

  for (let i = 0; i < pageCount; i++) {
    const page = pdf.loadPage(i);
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
