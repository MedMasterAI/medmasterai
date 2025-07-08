import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { getAuth } from "firebase-admin/auth"
import { dbAdmin } from "@/lib/firebase-admin"

const resend = new Resend(process.env.RESEND_API_KEY) // ← Usar la variable de entorno

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
    let stamps: number[] = (snap.exists && snap.get('supportEmailStamps')) || []
    const now = Date.now()
    stamps = stamps.filter(ts => now - ts < 60 * 60 * 1000)
    if (stamps.length >= 3) {
      return NextResponse.json({ error: 'Demasiados env\u00edos' }, { status: 429 })
    }
    stamps.push(now)
    await userRef.set({ supportEmailStamps: stamps }, { merge: true })

    const { nombre, email, mensaje } = await req.json()

    const { data, error } = await resend.emails.send({
      from: "Soporte MedMaster <onboarding@resend.dev>", // ← Cambia por tu dominio verificado
      to: ["medmaster.ai.envios@outlook.com.ar"], // ← Cambia por tu email real de soporte
      subject: `Consulta de Soporte – ${nombre}`,
      html: `
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${mensaje.replace(/\n/g, "<br/>")}</p>
      `,
      
    })

    if (error) {
      return NextResponse.json({ error: "No se pudo enviar el correo" }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
