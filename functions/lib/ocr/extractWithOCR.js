import { recognize } from "tesseract.js";
export async function extractWithOCR(buffer) {
    const { data } = await recognize(buffer, "spa", {
        logger: m => console.log("[OCR]", m.status, m.progress),
    });
    return data.text || "";
}
//# sourceMappingURL=extractWithOCR.js.map