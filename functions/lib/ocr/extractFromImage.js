import { recognize } from "tesseract.js";
export async function extractFromImage(base64) {
    const { data } = await recognize(Buffer.from(base64, "base64"), "spa", {
        // Corrección del tipo para el parámetro 'm'
        logger: (m) => console.log("[OCR Image]", m.status, m.progress),
    });
    return data.text || "";
}
//# sourceMappingURL=extractFromImage.js.map