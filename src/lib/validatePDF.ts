export function validateFile(file: File): { valid: boolean; error?: string } {
  const isPDF = file.type === "application/pdf" || file.name.endsWith(".pdf");

  if (!isPDF) {
    return { valid: false, error: "Please select a PDF file" };
  }

  return { valid: true };
}
