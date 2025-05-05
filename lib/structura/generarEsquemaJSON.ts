import { GoogleGenAI } from "@google/genai";
import { PROMPT_ESQUEMA_YAML } from '@lib/html/promptTemplates';

export interface EsquemaJSON {
  titulo: string;
  secciones: Array<{ encabezado: string; contenido: string }>;
}

// Inicializamos el cliente Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });

export async function generarEsquemaJSON(texto: string): Promise<EsquemaJSON> {
  const promptText = `${PROMPT_ESQUEMA_YAML}\n\n${texto}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro-preview-03-25",
    contents: promptText,
  });

  if (!response.text) {
    throw new Error('No se recibió texto en la respuesta de Gemini.');
  }

  let jsonText = response.text
    .replace(/^```json\r?\n?/, '')
    .replace(/\r?\n?```$/, '')
    .trim();

  let doc: any;
  try {
    console.log('--- JSON BRUTO ---\n' + jsonText);
    doc = JSON.parse(jsonText);
  } catch (err: any) {
    throw new Error(`Error al parsear JSON: ${err.message}\n\nTexto bruto:\n${jsonText}`);
  }

  // Validación: acepta tanto "secciones" como "bloques"
  const contenido = doc.secciones || doc.bloques;
  if (typeof doc.titulo !== 'string' || !Array.isArray(contenido)) {
    throw new Error(`Estructura JSON inesperada:\n${JSON.stringify(doc, null, 2)}`);
  }

  // Normalización: adapta "rango/texto" a "encabezado/contenido"
  return {
    titulo: doc.titulo,
    secciones: contenido.map((bloque: any) => ({
      encabezado: String(bloque.encabezado || bloque.rango || ''),
      contenido: String(bloque.contenido || bloque.texto || ''),
    })),
  };
}
