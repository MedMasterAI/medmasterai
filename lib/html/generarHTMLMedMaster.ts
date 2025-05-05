import { GoogleGenAI } from "@google/genai";
import { PROMPT_HTML_MEDMASTER } from './promptTemplates';

// Inicializamos el cliente de Gemini GenAI
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });

export async function generarHTMLMedMaster(esquema: any): Promise<string> {
  // Serializamos el esquema y lo preparamos en un solo prompt
  const esquemaStr = JSON.stringify(esquema);
  const promptText = `${PROMPT_HTML_MEDMASTER}\n\n${esquemaStr}`;

  // Hacemos la solicitud a la API de Gemini GenAI
  const response = await ai.models.generateContent({
    model: "learnlm-1.5-pro-experimental", // o 'gemini-1.5-pro' si es necesario
    contents: promptText,
  });

  // Verificamos si 'response.text' está definido
  if (!response.text) {
    throw new Error('No se recibió texto en la respuesta de Gemini.');
  }

  // Extraemos el texto generado
  const output = response.text.trim();

  // Retornamos el HTML limpio
  return output;
}

