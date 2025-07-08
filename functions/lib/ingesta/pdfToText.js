// lib/ingesta/pdfToText.ts
import pdfParse from "pdf-parse"; // Corregido: comillas dobles
import { createReadStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Writable } from "node:stream";
export async function pdfToText(filePath) {
    const chunks = [];
    await pipeline(createReadStream(filePath), new Writable({
        write(chunk, _enc, cb) {
            chunks.push(chunk);
            cb();
        },
    }));
    const pdfBuffer = Buffer.concat(chunks);
    const data = (await pdfParse(pdfBuffer));
    if (typeof data.text === "string") { // Corregido: comillas dobles
        return data.text;
    }
    // Si no se encuentra texto, lanzamos un error.
    throw new Error("No se pudo extraer texto del PDF.");
}
//# sourceMappingURL=pdfToText.js.map