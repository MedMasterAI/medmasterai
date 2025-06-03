// lib/ingesta/pdfToText.ts
import pdfParse from "pdf-parse"; // Corregido: comillas dobles
import * as fs from "node:fs/promises"; // Corregido: comillas dobles
export async function pdfToText(filePath) {
    // Primero, leemos el contenido del archivo PDF en un Buffer
    const pdfBuffer = await fs.readFile(filePath);
    // Ahora llamamos a pdfParse con el Buffer
    const data = (await pdfParse(pdfBuffer));
    if (typeof data.text === "string") { // Corregido: comillas dobles
        return data.text;
    }
    // Si no se encuentra texto, lanzamos un error.
    throw new Error("No se pudo extraer texto del PDF.");
}
//# sourceMappingURL=pdfToText.js.map