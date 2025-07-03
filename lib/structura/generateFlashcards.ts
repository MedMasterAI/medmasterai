import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! })

export interface Flashcard {
  pregunta: string
  respuesta: string
  tipo?: string // "oral" | "choice" | "flashcard"
}

const PROMPT_FLASHCARDS = `
Eres un asistente educativo experto en transformar apuntes en flashcards inteligentes para estudiantes de ciencias de la salud.

A partir del siguiente texto, generá una lista de 5 a 10 preguntas del tipo "flashcard" que permitan repasar conceptos clave, con respuestas breves y claras. Usá el formato JSON siguiente, sin comentarios y sin texto adicional:

[
  { "pregunta": "...", "respuesta": "...", "tipo": "flashcard" }
]
`

export async function generateFlashcards(texto: string): Promise<Flashcard[]> {
  const prompt = `${PROMPT_FLASHCARDS}\n\nTexto:\n${texto}`

  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro-preview-03-25",
    contents: prompt,
  })

  if (!response.text) throw new Error("No se obtuvo respuesta de Gemini")

  let jsonText = response.text
    .replace(/^```json\r?\n?/, "")
    .replace(/\r?\n?```$/, "")
    .trim()

  try {
    const flashcards = JSON.parse(jsonText)
    // Validar formato mínimo
    if (!Array.isArray(flashcards)) throw new Error("No es array")
    if (!flashcards.every((f: any) => typeof f.pregunta === "string" && typeof f.respuesta === "string"))
      throw new Error("Formato incorrecto en alguna flashcard")

    return flashcards as Flashcard[]
  } catch (err: any) {
    throw new Error(`Error al parsear flashcards: ${err.message}\n\nTexto:\n${jsonText}`)
  }
}
