// src/lib/pdf/splitPdfBuffer.ts
import { PDFDocument } from "pdf-lib";

export async function splitPdfByPageCount(
  buffer: Buffer,
  maxPages: number = 30
): Promise<Buffer[]> {
  const pdfDoc = await PDFDocument.load(buffer);
  const totalPages = pdfDoc.getPageCount();

  const buffers: Buffer[] = [];

  for (let i = 0; i < totalPages; i += maxPages) {
    const end = Math.min(i + maxPages, totalPages);
    const newPdf = await PDFDocument.create();
    const pages = await newPdf.copyPages(pdfDoc, Array.from({ length: end - i }, (_, j) => i + j));
    pages.forEach(page => newPdf.addPage(page));
    const newBuffer = Buffer.from(await newPdf.save());
    buffers.push(newBuffer);
  }

  return buffers;
}
