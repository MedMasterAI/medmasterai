import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
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
