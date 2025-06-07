
// src/app/api/webhook-mp/route.ts
import { NextResponse } from "next/server"
import admin from "firebase-admin"
import mercadopago from "@/lib/mercadopago"
import serviceAccount from "@/lib/frontedwebmedmaster-firebase-adminsdk-fbsvc-1e8dfbf46f.json"

const DEBUG = process.env.NODE_ENV !== 'production'

// Inicializa Admin SDK con la clave del JSON
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  })
}
const db = admin.firestore()

export async function POST(request: Request) {
  try {
    const { type, data } = (await request.json()) as {
      type: string
      data: { id: string }
    }
    if (DEBUG) console.log("🔔 Webhook MP recibido:", { type, data })

    if (type !== "payment") {
      return NextResponse.json({}, { status: 200 })
    }

    const paymentId = data.id
    const payment = await mercadopago.payment.findById(paymentId)
    if (DEBUG) console.log("⚡️ Payment completo:", payment.body)

    const uid = payment.body.external_reference
    const status = payment.body.status
    const dateApprovedMs = payment.body.date_approved
      ? new Date(payment.body.date_approved).getTime()
      : Date.now()
    const expiresAtMs = dateApprovedMs + 30 * 24 * 60 * 60 * 1000

    // Determina el plan comprado (puedes ajustar esta lógica si tienes más de un plan)
    const plan =
      payment.body.items && payment.body.items[0]?.title?.toLowerCase().includes("premium")
        ? "unlimited"
        : "pro"

    // Guarda la suscripción en la subcolección del usuario
    await db
      .collection("users")
      .doc(uid)
      .collection("subscriptions")
      .doc(paymentId)
      .set({
        paymentId,
        status,
        price: payment.body.transaction_amount,
        dateApproved: admin.firestore.Timestamp.fromMillis(dateApprovedMs),
        expiresAt: admin.firestore.Timestamp.fromMillis(expiresAtMs),
        plan,
      })

    // 👇 ACTUALIZA EL PLAN DEL USUARIO PRINCIPAL
    await db
      .collection("users")
      .doc(uid)
      .set(
        {
          plan,
          planExpiresAt: admin.firestore.Timestamp.fromMillis(expiresAtMs),
        },
        { merge: true }
      )

    if (DEBUG) {
      console.log(
        `✅ Suscripción ${paymentId} guardada para usuario ${uid} y plan actualizado`
      )
    }
    return NextResponse.json({}, { status: 200 })
  } catch (err: any) {
    console.error("❌ Error en webhook-mp:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
