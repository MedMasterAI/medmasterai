import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { LUPData, LUPResponse } from "../../../../types/lup";

export const runtime = "nodejs";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.MODEL_GEMINI || "gemini-2.5-pro-preview-06-05";

const AI_PROMPT = `Eres un planificador académico humano y empático.
1. Calcula el rango desde hoy hasta la fecha del examen de cada materia y usa todos los días disponibles.
2. La disponibilidad semanal se repite cada semana dentro de ese rango.
3. Distribuye temas y repasos de forma proporcional hasta el deadline evitando llenar solo la primera semana.
4. Ten en cuenta la prioridad de cada materia (alta, media o baja) y la dificultad del tema (fácil, intermedio o difícil).
5. Nunca programes más de 2 bloques por día ni repitas la misma materia en la jornada.
6. Añade bloques de repaso al menos 2 días después del estudio inicial de temas difíciles o intermedios.
7. Incluye los recursos proporcionados por el usuario cuando existan.
8. Si la disponibilidad es insuficiente para todos los temas y repasos, sugiere ampliar horarios, eliminar temas o extender la fecha.
9. Devuelve un JSON bajo la clave "plan" con los campos: fecha, materia, tema, tipo ("estudio" o "repaso"), dificultad, metodo_estudio, recursos, justificacion y hecho (false).
10. Si no puedes asignar todo, agrega un campo "sugerencias" con alternativas.`;

function extractPreferences(text: string) {
  const prefs: Record<string, any> = {};
  const lower = text.toLowerCase();
  if (lower.includes("mañana")) prefs.horarioPreferido = "mañana";
  if (lower.includes("tarde")) prefs.horarioPreferido = "tarde";
  const dias = [
    "lunes",
    "martes",
    "miercoles",
    "miércoles",
    "jueves",
    "viernes",
    "sabado",
    "sábado",
    "domingo",
  ];
  dias.forEach((d) => {
    const simple = d.normalize("NFD").replace(/[^\w]/g, "");
    if (lower.includes(`no puedo ${d}`) || lower.includes(`no ${d}`)) {
      prefs[`no${simple.charAt(0).toUpperCase() + simple.slice(1)}`] = true;
    }
  });
  if (lower.includes("repaso")) prefs.quiereRepasos = true;
  if (lower.includes("bloques cortos")) prefs.bloques = "cortos";
  if (lower.includes("bloques largos")) prefs.bloques = "largos";
  if (lower.includes("flashcards")) prefs.metodo = "flashcards";
  if (lower.includes("mapas")) prefs.metodo = "mapas mentales";
  if (lower.includes("resúmen")) prefs.metodo = "resúmenes";
  if (lower.includes("tests")) prefs.metodo = "tests";
  if (lower.includes("explicar")) prefs.metodo = "explicar a otros";
  return prefs;
}

export async function POST(req: Request) {
  try {
    const data = (await req.json()) as LUPData;
    const ai = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = ai.getGenerativeModel({ model: GEMINI_MODEL });
    const prefs = extractPreferences(data.presentacion || "");
    const metodos = Array.isArray(data.metodoEstudio)
      ? data.metodoEstudio.join(", ")
      : data.metodoEstudio;
    const prompt = `${AI_PROMPT}\n\nMétodos de estudio preferidos: ${metodos}\n\nPreferencias detectadas:\n${JSON.stringify(prefs, null, 2)}\n\nDatos del usuario:\n${JSON.stringify(data)}`;
    const res = await model.generateContent(prompt);
    const text = res.response?.text().trim() || "";

    let jsonText = text;
    const match = text.match(/```json([^`]+)```/s);
    if (match) jsonText = match[1];

    let parsed: LUPResponse;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      return NextResponse.json({ raw: text });
    }

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("Error generating LUP plan", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
