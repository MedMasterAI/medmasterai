
// src/app/api/webhook-mp/route.ts
import { NextResponse } from "next/server"
import { payment } from "@/lib/mercadopago"
import { dbAdmin } from "@/lib/firebase-admin"
import { Timestamp } from "firebase-admin/firestore"
import { PLAN_LIMITS } from "@/lib/plans"
import { createHmac } from "crypto"

export const runtime = 'nodejs'

const DEBUG = process.env.NODE_ENV !== 'production'

const db = dbAdmin

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-signature') || ''
    const tokenHeader = request.headers.get('x-webhook-token') || ''
    const secret = process.env.MP_WEBHOOK_SECRET
    const token = process.env.MP_WEBHOOK_TOKEN

    if (secret) {
      if (!signature) {
        if (DEBUG) console.warn('Missing signature header')
        return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
      }
      const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
      if (signature !== expected) {
        if (DEBUG) console.warn('Invalid webhook signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    } else if (token) {
      if (tokenHeader !== token) {
        if (DEBUG) console.warn('Invalid webhook token')
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }
    } else {
      if (DEBUG) console.warn('No webhook verification configured')
      return NextResponse.json({ error: 'Webhook verification not configured' }, { status: 401 })
    }

    const { type, data } = JSON.parse(rawBody) as {
      type: string
      data: { id: string }
    }
    if (DEBUG) console.log("🔔 Webhook MP recibido:", { type, data })

    if (type !== "payment") {
      return NextResponse.json({}, { status: 200 })
    }

    const paymentId = data.id
    const info = await payment.get({ id: paymentId })
    if (DEBUG) console.log("⚡️ Payment completo:", info)

      const uid = info.external_reference
      const status = info.status
      const dateApprovedMs = info.date_approved
        ? new Date(info.date_approved).getTime()
      : Date.now()
    const expiresAtMs = dateApprovedMs + 30 * 24 * 60 * 60 * 1000

    // Determina el plan comprado (puedes ajustar esta lógica si tienes más de un plan)
    const itemTitle = info.items?.[0]?.title?.toLowerCase() || ""
        const plan = itemTitle.includes("ilimitado") || itemTitle.includes("premium")
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
        price: info.transaction_amount,
        dateApproved: Timestamp.fromMillis(dateApprovedMs),
        expiresAt: Timestamp.fromMillis(expiresAtMs),
        plan,
      })

    // 👇 ACTUALIZA EL PLAN DEL USUARIO PRINCIPAL
    await db
      .collection("users")
      .doc(uid)
      .set(
        {
          plan,
          planExpiresAt: Timestamp.fromMillis(expiresAtMs),
          pdfCredits: PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS].pdf,
          videoCredits: PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS].video,
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
