import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { LUPData, LUPResponse } from '../../../../types/lup'

export const runtime = 'nodejs'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_MODEL = process.env.MODEL_GEMINI || 'gemini-2.5-pro-preview-06-05'

const AI_PROMPT = `
Eres un planificador académico experto y humano, y debes priorizar realismo y bienestar.

1. Recibirás una lista de materias (con importancia), temas (con dificultad), y fechas de examen opcionales.
2. Recibirás una tabla de bloques de disponibilidad (días y horas). Las casillas marcadas son BLOQUES LIBRES.
3. Prioriza las materias más importantes y los temas más difíciles, teniendo en cuenta exámenes más cercanos.
4. Nunca asignes más de 2 bloques de estudio por día. Si hay más bloques para asignar, distribúyelos en días diferentes.
5. No asignes nunca el mismo tema o materia en dos bloques consecutivos el mismo día.
6. Siempre que puedas, intercala materias para evitar saturación.
7. Si un tema es difícil o largo, divídelo en varias partes y distribúyelo en días distintos.
8. Después de asignar un tema, agenda automáticamente un bloque de "repaso" 2-3 días después, si hay bloques libres.
9. Si la disponibilidad es insuficiente, en vez de forzar todo en un día, devuelve sugerencias humanas: “agrega más bloques libres, elimina temas, o mueve la fecha de examen”.
10. El objetivo es que el plan sea realista, flexible y humano, no solo llenar todos los huecos ni forzar al usuario a estudiar varias horas seguidas.
11. En cada asignación de bloque, incluye un campo "justificacion" explicando brevemente el motivo de esa asignación.
12. Devuelve SOLO un JSON bajo la clave "plan" con una lista de objetos, cada uno con:
   - fecha (día y hora)
   - materia
   - tema
   - tipo ("estudio" o "repaso")
   - justificacion (breve explicación del porqué de esa asignación)
13. Si no puedes asignar todo realísticamente, devuelve también un campo "sugerencias" con alternativas humanas y razonables.
`

function extractPreferences(text: string) {
  const prefs: Record<string, any> = {}
  const lower = text.toLowerCase()
  if (lower.includes('mañana')) prefs.horarioPreferido = 'mañana'
  if (lower.includes('tarde')) prefs.horarioPreferido = 'tarde'
  const dias = ['lunes', 'martes', 'miercoles', 'miércoles', 'jueves', 'viernes', 'sabado', 'sábado', 'domingo']
  dias.forEach(d => {
    const simple = d.normalize('NFD').replace(/[^\w]/g, '')
    if (lower.includes(`no puedo ${d}`) || lower.includes(`no ${d}`)) {
      prefs[`no${simple.charAt(0).toUpperCase() + simple.slice(1)}`] = true
    }
  })
  if (lower.includes('repaso')) prefs.quiereRepasos = true
  if (lower.includes('bloques cortos')) prefs.bloques = 'cortos'
  if (lower.includes('bloques largos')) prefs.bloques = 'largos'
  return prefs
}

export async function POST(req: Request) {
  try {
    const data = (await req.json()) as LUPData
    const ai = new GoogleGenerativeAI(GEMINI_API_KEY)
    const model = ai.getGenerativeModel({ model: GEMINI_MODEL })
    const prefs = extractPreferences(data.presentacion || '')
    const prompt = `${AI_PROMPT}\n\nPreferencias detectadas:\n${JSON.stringify(prefs, null, 2)}\n\nDatos del usuario:\n${JSON.stringify(data)}`
    const res = await model.generateContent(prompt)
    const text = res.response?.text().trim() || ''

    let jsonText = text
    const match = text.match(/```json([^`]+)```/s)
    if (match) jsonText = match[1]

    let parsed: LUPResponse
    try {
      parsed = JSON.parse(jsonText)
    } catch {
      return NextResponse.json({ raw: text })
    }

    return NextResponse.json(parsed)
  } catch (err: any) {
    console.error('Error generating LUP plan', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
