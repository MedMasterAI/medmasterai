import fs from "fs/promises";
import { File } from "formidable";

/**
 * Convierte un PDF o una imagen subida a un array de cadenas base64.
 * De momento, devuelve todo el contenido en una sola “imagen” base64.
 * Más adelante podremos diferenciar páginas de PDF en múltiples imágenes.
 *
 * @param uploaded File validado por validateUpload()
 * @returns Array de datos base64 tipo data:...;base64
 */
export async function pdfToImages(uploaded: File): Promise<string[]> {
  // Leemos el archivo desde el disco
  const buffer = await fs.readFile(uploaded.filepath);
  // Convertimos a base64
  const base64 = buffer.toString("base64");
  // Y devolvemos el data URI completo
  return [`data:${uploaded.mimetype};base64,${base64}`];
}
