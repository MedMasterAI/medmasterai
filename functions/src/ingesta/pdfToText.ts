// lib/ingesta/pdfToText.ts
import pdfParse from "pdf-parse"; // Corregido: comillas dobles
import { createReadStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Writable } from "node:stream";

// Definimos una interfaz para la estructura que esperamos de 'pdf-parse'
interface ParsedPdfData {
  text: string;
  // Añade otras propiedades que uses de la salida de pdf-parse si las necesitas
  // info: object;
  // metadata: object;
  // n_pages: number;
}

export async function pdfToText(filePath: string): Promise<string> {
  const chunks: Buffer[] = [];
  await pipeline(
    createReadStream(filePath),
    new Writable({
      write(chunk, _enc, cb) {
        chunks.push(chunk as Buffer);
        cb();
      },
    })
  );
  const pdfBuffer = Buffer.concat(chunks);

  const data: ParsedPdfData = (await pdfParse(pdfBuffer)) as ParsedPdfData;

  if (typeof data.text === "string") { // Corregido: comillas dobles
    return data.text;
  }
  // Si no se encuentra texto, lanzamos un error.
  throw new Error("No se pudo extraer texto del PDF.");
}
