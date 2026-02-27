import { extractTextFromPDF } from "./processPDF.ts";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

const uploadPDF = async (file: File) => {
  if (!file || !(file instanceof File)) {
    throw new Error("No PDF file provided");
  }

  if (!file.type.includes("pdf") && !file.name.endsWith(".pdf")) {
    throw new Error("File must be a PDF");
  }

  if (file.size > MAX_SIZE) {
    throw new Error("File size exceeds 10 MB limit");
  }

  const arrayBuffer = await file.arrayBuffer();

  try {
    const result = await extractTextFromPDF(arrayBuffer);

    if (!result.success) {
      throw new Error("Failed to process PDF");
    }

    return {
      success: true,
      fileName: file.name,
      fileSize: file.size,
      message: "PDF processed successfully",
      document: result.document,
      pageCount: result.pageCount,
      pages: result.pages,
      metadata: result.metadata,
    };
  } catch (error) {
    console.error("Failed to process upload", error);

    throw error;
  }
};

export default uploadPDF;
