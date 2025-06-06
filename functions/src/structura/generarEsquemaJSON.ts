// lib/structura/generarEsquemaJSON.ts
import { GoogleGenerativeAI } from "@google/generative-ai";


import { PROMPT_ESQUEMA_YAML } from "../html/promptTemplates.js";

export interface EsquemaJSON {
  titulo: string;
  secciones: Array<{ encabezado: string; contenido: string }>;
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL_2_5_PRO_PREVIEW_03_25 =
  process.env.MODEL_GEMINI_2_5_PRO_PREVIEW_03_25 ||
  "gemini-2.5-pro-preview-03-25";
const ai = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function generarEsquemaJSON(texto: string): Promise<EsquemaJSON> {
  const promptText = `${PROMPT_ESQUEMA_YAML}\n\n${texto}`;

  const model = ai.getGenerativeModel({ model: GEMINI_MODEL_2_5_PRO_PREVIEW_03_25 });

  const response = await model.generateContent(promptText);

  if (!response.response) {
    throw new Error("No se obtuvo objeto de respuesta válido de Gemini.");
  }

  const textResult = response.response.text();

  if (!textResult) {
    throw new Error("No se recibió texto en la respuesta de Gemini.");
  }

  const jsonText = textResult
    .replace(/^```json\r?\n?/, "")
    .replace(/\r?\n?```$/, "")
    .trim();

  let doc: {
    titulo: string;
    secciones?: Array<{ encabezado?: string; rango?: string; contenido?: string; texto?: string }>;
    bloques?: Array<{ encabezado?: string; rango?: string; contenido?: string; texto?: string }>;
  };
  try {
    console.log("--- JSON BRUTO ---\n" + jsonText);
    doc = JSON.parse(jsonText);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    throw new Error(`Error al parsear JSON: ${errorMessage}\n\nTexto bruto:\n${jsonText}`);
  }

  const contenido = doc.secciones || doc.bloques;
  if (typeof doc.titulo !== "string" || !Array.isArray(contenido)) {
    throw new Error(`Estructura JSON inesperada:\n${JSON.stringify(doc, null, 2)}`);
  }

  return {
    titulo: doc.titulo,
    // Corregido: 'arrow-parens' - Eliminadas las paréntesis del argumento único
    secciones: contenido.map(bloque => ({
      encabezado: String(bloque.encabezado || bloque.rango || ""),
      contenido: String(bloque.contenido || bloque.texto || ""),
    })),
  };
}
