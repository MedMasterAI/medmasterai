import { createReadStream } from "node:fs";
import { unlink } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import { Writable } from "node:stream";
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
  let base64 = "";
  await pipeline(
    createReadStream(uploaded.filepath),
    new Writable({
      write(chunk, _enc, cb) {
        base64 += (chunk as Buffer).toString("base64");
        cb();
      },
    })
  );
  await unlink(uploaded.filepath).catch(() => {});
  return [`data:${uploaded.mimetype};base64,${base64}`];
}
