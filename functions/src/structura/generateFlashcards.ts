// lib/structura/generateFlashcards.ts
import { GoogleGenerativeAI } from "@google/generative-ai";


export interface Flashcard {
  pregunta: string;
  respuesta: string;
  tipo?: string; // "oral" | "choice" | "flashcard"
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_FLASHCARDS_MODEL = process.env.MODEL_GEMINI_2_5_PRO_PREVIEW_03_25 || "gemini-2.5-pro-preview-03-25";

const ai = new GoogleGenerativeAI(GEMINI_API_KEY);

const PROMPT_FLASHCARDS = `
Eres un asistente educativo experto en transformar apuntes en flashcards inteligentes para estudiantes de ciencias de la salud.

A partir del siguiente texto, generá una lista de 5 a 10 preguntas del tipo "flashcard" que permitan repasar conceptos clave, con respuestas breves y claras. Usá el formato JSON siguiente, sin comentarios y sin texto adicional:

[
  { "pregunta": "...", "respuesta": "...", "tipo": "flashcard" }
]
`;

export async function generateFlashcards(texto: string): Promise<Flashcard[]> {
  const prompt = `${PROMPT_FLASHCARDS}\n\nTexto:\n${texto}`;

  const model = ai.getGenerativeModel({ model: GEMINI_FLASHCARDS_MODEL });

  const response = await model.generateContent(prompt);

  if (!response.response) {
    throw new Error("No se obtuvo objeto de respuesta válido de Gemini.");
  }
  const textResult = response.response.text();

  if (!textResult) {
    throw new Error("No se obtuvo texto en la respuesta de Gemini");
  }

  const jsonText = textResult
    .replace(/^```json\r?\n?/, "")
    .replace(/\r?\n?```$/, "")
    .trim();

  try {
    const flashcards = JSON.parse(jsonText) as unknown[];

    if (!Array.isArray(flashcards)) {
      throw new Error("La respuesta JSON no es un array.");
    }

    const isValidFlashcard = (f: unknown): f is Flashcard => {
      return (
        typeof f === "object" &&
        f !== null &&
        "pregunta" in f &&
        typeof (f as Flashcard).pregunta === "string" &&
        "respuesta" in f &&
        typeof (f as Flashcard).respuesta === "string"
      );
    };

    if (!flashcards.every(isValidFlashcard)) {
      throw new Error("Formato incorrecto en alguna flashcard.");
    }

    return flashcards as Flashcard[];
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    throw new Error(`Error al parsear flashcards: ${errorMessage}\n\nTexto:\n${jsonText}`);
  }
}
