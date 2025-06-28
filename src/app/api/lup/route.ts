import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { LUPData } from '@/types/lup'

export const runtime = 'nodejs'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_MODEL = process.env.MODEL_GEMINI || 'gemini-pro'

const AI_PROMPT = `Eres un planificador de estudios. Analiza la presentación del usuario y distribuye los temas de sus materias en los bloques disponibles. Devuelve solo un JSON con la clave "plan" donde cada elemento tenga fecha, materia, tema y tipo.`

export async function POST(req: Request) {
  try {
    const data = (await req.json()) as LUPData
    const ai = new GoogleGenerativeAI(GEMINI_API_KEY)
    const model = ai.getGenerativeModel({ model: GEMINI_MODEL })
    const prompt = `${AI_PROMPT}\n\nDatos del usuario:\n${JSON.stringify(data)}`
    const res = await model.generateContent(prompt)
    const text = res.response?.text().trim() || ''
    try {
      const plan = JSON.parse(text)
      return NextResponse.json({ plan })
    } catch {
      return NextResponse.json({ raw: text })
    }
  } catch (err: any) {
    console.error('Error generating LUP plan', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
