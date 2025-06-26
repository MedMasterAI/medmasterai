import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from 'firebase-admin/auth'
import { dbAdmin } from '@/lib/firebase-admin'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const runtime = 'nodejs'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_MODEL = process.env.MODEL_GEMINI || 'gemini-pro'
const GEMINI_MODEL_FALLBACK =
  process.env.MODEL_GEMINI_FALLBACK || 'gemini-1.5-pro'

const ai = new GoogleGenerativeAI(GEMINI_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || ''
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 401 })
    }
    const idToken = authHeader.split(' ')[1]
    const decoded = await getAuth().verifyIdToken(idToken)
    const uid = decoded.uid

    const { question } = await req.json()
    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Pregunta inválida' }, { status: 400 })
    }

    const userRef = dbAdmin.collection('users').doc(uid)
    const userSnap = await userRef.get()
    const data = userSnap.data() || {}
    const safeUser = {
      plan: data.plan || 'free',
      planExpiresAt: data.planExpiresAt || null,
      pdfCredits: data.pdfCredits ?? 0,
      videoCredits: data.videoCredits ?? 0,
      name: data.name || ''
    }

    const notesSnap = await userRef
      .collection('notes')
      .orderBy('createdAt', 'desc')
      .limit(3)
      .get()
    const notes = notesSnap.docs.map(d => {
      const n = d.data() || {}
      return {
        id: d.id,
        fileName: n.fileName || '',
        status: n.status || '',
        createdAt: n.createdAt?.toDate?.().toISOString?.() || null
      }
    })

    const contextObj = { user: safeUser, notes }
    const context = JSON.stringify(contextObj, null, 2)

    const systemPrompt = `Eres el asistente virtual de MedMaster. Responde solo con la informacion proporcionada y conocimientos generales de la app. No reveles datos de otros usuarios ni informacion interna. No realices acciones de escritura.`

    const prompt = `${systemPrompt}\n\nContexto:\n${context}\n\nPregunta del usuario: ${question}\nRespuesta en español:`

    try {
      const model = ai.getGenerativeModel({ model: GEMINI_MODEL })
      const response = await model.generateContent(prompt)
      const answer = response.response?.text().trim()
      if (answer) {
        return NextResponse.json({ answer })
      }
      console.warn(`Modelo ${GEMINI_MODEL} no devolvió texto, usando fallback`)
    } catch (mainErr) {
      console.warn(`Error en modelo ${GEMINI_MODEL}:`, (mainErr as any).message)
    }

    const fallback = ai.getGenerativeModel({ model: GEMINI_MODEL_FALLBACK })
    const fbRes = await fallback.generateContent(prompt)
    const fbAnswer = fbRes.response?.text().trim()
    if (!fbAnswer) throw new Error('Respuesta vacía de la IA (fallback)')

    return NextResponse.json({ answer: fbAnswer })
  } catch (err: any) {
    console.error('❌ Error en asistente:', err.message)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
