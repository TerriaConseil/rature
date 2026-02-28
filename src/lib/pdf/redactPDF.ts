import { type PDFDocument } from "mupdf";

import type { GroupedEntity } from "@/types/index.ts";

export function redactPDFDocument(pdf: PDFDocument, entities: GroupedEntity[]) {
  const uniqueEntities = new Set();
  const pageCount = pdf.countPages();

  for (let i = 0; i < pageCount; i++) {
    const page = pdf.loadPage(i);
    const structuredText = page.toStructuredText("preserve-whitespace");

    for (const entity of entities.filter((entity) => entity.text.length > 1)) {
      if (uniqueEntities.has(entity.text)) {
        continue;
      }

      uniqueEntities.add(entity.text);

      const searchResults = structuredText.search(entity.text);

      for (const result of searchResults) {
        const annotation = page.createAnnotation("Redact");

        annotation.setQuadPoints(result);
        annotation.applyRedaction();
      }
    }
  }

  const uint8Array = pdf.saveToBuffer().asUint8Array();
  const blob = new Blob([new Uint8Array(uint8Array)], { type: 'application/pdf' });

  const url = URL.createObjectURL(blob);

  return url;
}
