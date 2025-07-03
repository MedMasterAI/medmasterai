// lib/ingesta/pdfToText.ts
import pdfParse from "pdf-parse"; // Corregido: comillas dobles
import * as fs from "node:fs/promises"; // Corregido: comillas dobles

// Definimos una interfaz para la estructura que esperamos de 'pdf-parse'
interface ParsedPdfData {
  text: string;
  // Añade otras propiedades que uses de la salida de pdf-parse si las necesitas
  // info: object;
  // metadata: object;
  // n_pages: number;
}

export async function pdfToText(filePath: string): Promise<string> {
  // Primero, leemos el contenido del archivo PDF en un Buffer
  const pdfBuffer: Buffer = await fs.readFile(filePath);

  // Ahora llamamos a pdfParse con el Buffer
  const data: ParsedPdfData = (await pdfParse(pdfBuffer)) as ParsedPdfData;

  if (typeof data.text === "string") { // Corregido: comillas dobles
    return data.text;
  }
  // Si no se encuentra texto, lanzamos un error.
  throw new Error("No se pudo extraer texto del PDF.");
}
