import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { LUPData, LUPResponse } from '../../../../types/lup'

export const runtime = 'nodejs'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_MODEL = process.env.MODEL_GEMINI || 'gemini-2.5-pro-preview-06-05'

const AI_PROMPT = `
Eres un planificador académico experto. 
1. Recibirás una lista de materias con sus temas y, opcionalmente, fechas de examen.
2. También recibirás una tabla con mis bloques de disponibilidad (días y horas). 
   Asume que las casillas marcadas son los BLOQUES LIBRES para estudiar.
3. Ten en cuenta la dificultad indicada para cada tema, priorizando los más difíciles.
4. Si alguna materia tiene fecha de examen, organiza revisiones periódicas y un repaso final antes de esa fecha.
5. Devuelve un JSON bajo la clave "plan" que contenga:
   - fecha (día y hora),
   - materia,
   - tema,
   - tipo de actividad (estudio nuevo o repaso),
   - breve justificación del porqué de esa asignación.
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
