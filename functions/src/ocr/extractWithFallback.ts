// lib/ocr/extractWithFallback.ts
import { recognize } from "tesseract.js";
import { ImageAnnotatorClient } from "@google-cloud/vision"; // Importamos directamente el named export

// Instanciamos el cliente usando el named export directamente
const visionClient = new ImageAnnotatorClient();

// Utiliza Tesseract para OCR local
async function extractWithTesseract(base64: string): Promise<string> {
  try {
    const { data } = await recognize(Buffer.from(base64, "base64"), "spa", {
      logger: m => console.log("[Tesseract]", String(m.status), String(m.progress)),
    });
    return data.text || "";
  } catch (err: unknown) {
    console.error("❌ Error con Tesseract:", err);
    return "";
  }
}

// Utiliza Google Cloud Vision API como alternativa
async function extractWithVision(base64: string): Promise<string> {
  try {
    const [result] = await visionClient.documentTextDetection({
      image: { content: base64 },
    });

    const fullText = result.fullTextAnnotation?.text || "";
    console.log("✅ OCR con Google Vision (fallback):", fullText.slice(0, 300));
    return fullText;
  } catch (err: unknown) {
    console.error("❌ Error con Google Vision:", err);
    return "";
  }
}

// Función final que intenta con Tesseract y si falla usa Vision
export async function extractWithFallback(base64: string): Promise<string> {
  const textoTesseract = await extractWithTesseract(base64);
  if (textoTesseract && textoTesseract.trim().length > 100) return textoTesseract;

  console.log("⚠️ Usando Google Vision como fallback");
  const textoVision = await extractWithVision(base64);
  return textoVision;
}
