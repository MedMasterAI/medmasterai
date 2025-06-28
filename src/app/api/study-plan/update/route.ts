import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const runtime = 'nodejs'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_MODEL = process.env.MODEL_GEMINI || 'gemini-pro'

const AI_PROMPT = `Analiza el historial de bloques de estudio, feedback y resultados de autoevaluaci\u00f3n del usuario. Ajusta el plan de estudio diario priorizando los m\u00e9todos m\u00e1s efectivos. Devuelve un JSON actualizado con el nuevo plan.`

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const ai = new GoogleGenerativeAI(GEMINI_API_KEY)
    const model = ai.getGenerativeModel({ model: GEMINI_MODEL })
    const prompt = `${AI_PROMPT}\n\nPlan actual:\n${JSON.stringify(body)}`
    const res = await model.generateContent(prompt)
    const text = res.response?.text().trim() || ''
    try {
      const plan = JSON.parse(text)
      return NextResponse.json({ plan })
    } catch {
      return NextResponse.json({ raw: text })
    }
  } catch (err: any) {
    console.error('Error generating plan', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
