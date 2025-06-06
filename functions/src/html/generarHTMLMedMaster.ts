import { GoogleGenerativeAI } from "@google/generative-ai";
import { PROMPT_HTML_MEDMASTER } from "./promptTemplates.js";
import { EsquemaJSON } from "../structura/generarEsquemaJSON.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const MODEL_GEMINI_2_5 = process.env.MODEL_GEMINI_2_5_PRO_PREVIEW || "gemini-2.5-pro-preview-05-06";
const MODEL_GEMINI_1_5 = process.env.MODEL_GEMINI_1_5_PRO || "gemini-1.5-pro";
const ai = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function generarHTMLMedMaster(esquema: EsquemaJSON): Promise<string> {
  const esquemaStr = JSON.stringify(esquema);
  const promptText = `${PROMPT_HTML_MEDMASTER}\n\n${esquemaStr}`;

  // 1️⃣ Intenta con el modelo principal (2.5)
  try {
    const model = ai.getGenerativeModel({ model: MODEL_GEMINI_2_5 });
    const response = await model.generateContent(promptText);
    const textResult = response.response.text();
    if (textResult) return textResult.trim();
    console.warn(`⚠️ ${MODEL_GEMINI_2_5} no devolvió texto, usando fallback`);
  } catch (expErr: any) {
    console.warn(`⚠️ Error en modelo ${MODEL_GEMINI_2_5}:`, expErr);
  }

  // 2️⃣ Fallback (1.5)
  const fallbackModel = ai.getGenerativeModel({ model: MODEL_GEMINI_1_5 });
  const fallbackResponse = await fallbackModel.generateContent(promptText);
  const fallbackText = fallbackResponse.response.text();
  if (!fallbackText) throw new Error(`No se recibió texto de fallback ${MODEL_GEMINI_1_5}`);
  return fallbackText.trim();
}
