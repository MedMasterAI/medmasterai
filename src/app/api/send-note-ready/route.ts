import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { getAuth } from "firebase-admin/auth"
import { dbAdmin } from "@/lib/firebase-admin"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || ''
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 401 })
    }
    const idToken = authHeader.split(' ')[1]
    const decoded = await getAuth().verifyIdToken(idToken)
    const uid = decoded.uid

    const userRef = dbAdmin.collection('users').doc(uid)
    const snap = await userRef.get()
    let stamps: number[] = (snap.exists && snap.get('noteEmailStamps')) || []
    const now = Date.now()
    stamps = stamps.filter(ts => now - ts < 60 * 60 * 1000)
    if (stamps.length >= 5) {
      return NextResponse.json({ error: 'Demasiados env\u00edos' }, { status: 429 })
    }
    stamps.push(now)
    await userRef.set({ noteEmailStamps: stamps }, { merge: true })

    const { email, url } = await req.json()
    if (!email || !url) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 })
    }
    const { error } = await resend.emails.send({
      from: "MedMaster <onboarding@resend.dev>",
      to: [email],
      subject: "Tu apunte está listo",
      html: `<p>Hola!</p><p>Tu apunte está listo para descargar.</p><p><a href="${url}">Descargar apunte</a></p>`
    })
    if (error) {
      return NextResponse.json({ error: "No se pudo enviar el correo" }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
