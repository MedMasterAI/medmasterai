import { GoogleGenAI } from "@google/genai"
import { PROMPT_HTML_MEDMASTER } from "./promptTemplates"

// Inicializa el cliente de Gemini GenAI
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! })

/**
 * Genera HTML profesional a partir de un esquema JSON.
 * Si falla el modelo experimental, hace fallback a gemini-1.5-pro.
 */
export async function generarHTMLMedMaster(esquema: any): Promise<string> {
  const esquemaStr = JSON.stringify(esquema)
  const promptText = `${PROMPT_HTML_MEDMASTER}\n\n${esquemaStr}`

  // 1️⃣ Intento con modelo experimental
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro-preview-05-06",
      contents: promptText,
    })
    if (response.text) {
      return response.text.trim()
    }
    console.warn("⚠️ gemini-2.5-pro-preview-05-06 no devolvió texto, usando fallback")
  } catch (expErr: any) {
    console.warn("⚠️ Error en modelo experimental:", expErr)
  }

  // 2️⃣ Fallback a gemini-1.5-pro
  const fallback = await ai.models.generateContent({
    model: "gemini-1.5-pro",
    contents: promptText,
  })
  if (!fallback.text) {
    throw new Error("No se recibió texto de fallback gemini-1.5-pro")
  }
  return fallback.text.trim()
}
