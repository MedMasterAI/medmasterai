import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY) // ← Usar la variable de entorno

export async function POST(req: NextRequest) {
  try {
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
