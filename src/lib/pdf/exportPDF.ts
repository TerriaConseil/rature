import type { PDFDocument } from "mupdf";

const METADATA_FIELDS = [
  "info:Title",
  "info:Author",
  "info:Subject",
  "info:Keywords",
  "info:Creator",
  "info:Producer",
  "info:CreationDate",
  "info:ModDate",
];

export function downloadPDFDocument(
  pdf: PDFDocument,
  fileName: string,
  removeMetadata: boolean
): void {
  if (removeMetadata) {
    for (const field of METADATA_FIELDS) {
      try {
        pdf.setMetaData(field, "");
      } catch {
        // Field may not exist in this document — skip silently
      }
    }
  }

  const uint8Array = pdf.saveToBuffer().asUint8Array();
  const blob = new Blob([new Uint8Array(uint8Array)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const baseName = fileName.replace(/\.pdf$/i, "");
  const a = document.createElement("a");
  a.href = url;
  a.download = `${baseName}_anonymise.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
