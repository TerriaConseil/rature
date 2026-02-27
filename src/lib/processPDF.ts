import { PDFDocument, type PDFPage, type StructuredText } from "mupdf";
import { Buffer } from "buffer";

export interface PDFExtractionResult {
  success: boolean;
  document: PDFDocument | null;
  pageCount: number;
  pages: PageContent[];
  metadata?: PDFMetadata;
  error?: string;
}

export interface PageContent {
  pdfPage: PDFPage;
  pageNumber: number;
  structuredText: StructuredText;
  text: string;
  wordCount: number;
}

export interface PDFMetadata {
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
}

function extractTextFromStructuredJSON(jsonString: string): string {
  try {
    const structured = JSON.parse(jsonString);
    const textParts: string[] = [];

    // MuPDF structured text format has blocks containing lines containing chars
    if (structured.blocks) {
      for (const block of structured.blocks) {
        if (block.lines) {
          for (const line of block.lines) {
            if (line.text) {
              textParts.push(line.text);
            }
          }
        }
      }
    }

    return textParts.join(" ");
  } catch (error) {
    console.error("Failed to parse structured text JSON:", error);
    return "";
  }
}

function extractMetadata(doc: PDFDocument): PDFMetadata {
  try {
    const metadata: PDFMetadata = {};

    // Try to get standard metadata fields
    const info = doc.getMetaData("info:Title");
    if (info) metadata.title = info;

    const author = doc.getMetaData("info:Author");
    if (author) metadata.author = author;

    const subject = doc.getMetaData("info:Subject");
    if (subject) metadata.subject = subject;

    const creator = doc.getMetaData("info:Creator");
    if (creator) metadata.creator = creator;

    const producer = doc.getMetaData("info:Producer");
    if (producer) metadata.producer = producer;

    const creationDate = doc.getMetaData("info:CreationDate");
    if (creationDate) metadata.creationDate = creationDate;

    return metadata;
  } catch (error) {
    console.warn("Failed to extract metadata:", error);
    return {};
  }
}

function handlePDFError(error: unknown): PDFExtractionResult {
  console.error("PDF processing error:", error);

  const response = {
    success: false,
    document: null,
    error: "Failed to process PDF",
    text: [],
    pageCount: 0,
    pages: [],
  };

  if (error instanceof Error) {
    if (error.message.includes("password") || error.message.includes("encrypted")) {
      response.error = "Password-protected PDFs are not supported";

      return response;
    }

    if (error.message.includes("invalid") || error.message.includes("malformed")) {
      response.error = "Invalid or corrupted PDF file";
      return response;
    }
  }

  return response;
}

export async function extractTextFromPDF(
  fileBuffer: ArrayBuffer
): Promise<PDFExtractionResult> {
  try {
    // Convert ArrayBuffer to Buffer
    const buffer = Buffer.from(fileBuffer);

    // Open PDF document
    const doc = PDFDocument.openDocument(buffer, "application/pdf") as PDFDocument;

    // Get page count
    const pageCount = doc.countPages();

    // Extract text from all pages
    const pages: PageContent[] = [];

    for (let i = 0; i < pageCount; i++) {
      const page = doc.loadPage(i);
      const structuredText = page.toStructuredText("preserve-whitespace");
      const pageText = structuredText.asJSON();

      // Parse JSON and extract text
      const textContent = extractTextFromStructuredJSON(pageText);

      pages.push({
        pdfPage: page,
        pageNumber: i + 1,
        structuredText,
        text: textContent,
        wordCount: textContent.split(/\s+/).filter(Boolean).length,
      });
    }

    // Extract metadata
    const metadata = extractMetadata(doc);

    return {
      success: true,
      document: doc,
      pageCount,
      pages,
      metadata,
    };
  } catch (error) {
    return handlePDFError(error);
  }
}
