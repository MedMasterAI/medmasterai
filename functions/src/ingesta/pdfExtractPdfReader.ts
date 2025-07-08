// lib/ingesta/pdfExtractPdfReader.ts
import { PdfReader } from "pdfreader";

interface PdfTextItem {
  text: string;
  y: number;
  x?: number;
  w?: number;
  h?: number;
}

// Corregido: La expresión de retorno ahora se evalúa limpiamente a un booleano.
function isPdfTextItem(item: unknown): item is PdfTextItem {
  // Corregido: 'quotes' - Cambiado a comillas dobles
  return typeof item === "object" && item !== null &&
         typeof (item as PdfTextItem).text === "string" &&
         typeof (item as PdfTextItem).y === "number";
}


export async function pdfExtract(data: Uint8Array): Promise<string> {
  return new Promise((resolve, reject) => {
    const buffer = Buffer.from(data);
    let lastY: number | null = null;
    let result = "";

    new PdfReader().parseBuffer(buffer, (err: unknown, item: unknown) => {
      if (err) {
        if (err instanceof Error) {
          return reject(err);
        }
        return reject(new Error(`PdfReader error: ${String(err)}`));
      }
      if (!item) {
        return resolve(result);
      }

      if (isPdfTextItem(item)) {
        if (lastY !== item.y) {
          result += "\n";
          lastY = item.y;
        }
        result += item.text;
      }
    });
  });
}

export async function pdfExtractFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let lastY: number | null = null;
    let result = "";
    new PdfReader().parseFileItems(filePath, (err: unknown, item: unknown) => {
      if (err) {
        if (err instanceof Error) {
          return reject(err);
        }
        return reject(new Error(`PdfReader error: ${String(err)}`));
      }
      if (!item) {
        return resolve(result);
      }
      if (isPdfTextItem(item)) {
        if (lastY !== item.y) {
          result += "\n";
          lastY = item.y;
        }
        result += item.text;
      }
    });
  });
}
