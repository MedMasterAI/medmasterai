// lib/ingesta/pdfExtractPdfReader.ts
import { PdfReader } from "pdfreader";
// Corregido: La expresión de retorno ahora se evalúa limpiamente a un booleano.
function isPdfTextItem(item) {
    // Corregido: 'quotes' - Cambiado a comillas dobles
    return typeof item === "object" && item !== null &&
        typeof item.text === "string" &&
        typeof item.y === "number";
}
export async function pdfExtract(data) {
    return new Promise((resolve, reject) => {
        const buffer = Buffer.from(data);
        let lastY = null;
        let result = "";
        new PdfReader().parseBuffer(buffer, (err, item) => {
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
//# sourceMappingURL=pdfExtractPdfReader.js.map