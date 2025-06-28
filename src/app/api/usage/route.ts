
import { NextResponse } from "next/server"
import { dbAdmin } from '@/lib/firebase-admin'

const PLAN_LIMITS = {
  free:      { pdf: 2,  video: 1 },
  basic:     { pdf: 5,  video: 5 },
  pro:       { pdf: 20, video: 20 },
  express:   { pdf: 3,  video: 2 },
  extra:     { pdf: 0,  video: 5 },
  unlimited: { pdf: Infinity, video: Infinity }
}

export async function POST(req: Request) {
  try {
    const { type, uid, plan } = (await req.json()) as {
      type: "pdf" | "video"
      uid: string
      plan: keyof typeof PLAN_LIMITS
    }

    if (!plan || !PLAN_LIMITS[plan]) {
      return NextResponse.json({ error: "Plan inválido" }, { status: 400 })
    }

    // --- Control de periodo mensual (usá mes/año) ---
    const now = new Date()
    const period = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`

    const usageRef = dbAdmin
      .collection("users")
      .doc(uid)
      .collection("usage")
      .doc(period)

    const snap = await usageRef.get()
    let { pdfCount = 0, videoCount = 0 } = snap.exists ? snap.data()! : {}

    const userSnap = await dbAdmin.collection('users').doc(uid).get()
    const isAdmin = userSnap.exists ? userSnap.get('isAdmin') === true : false

    const MAX_VIDEOS_PER_MONTH = 20

    // Límite según plan
    const limits = PLAN_LIMITS[plan]
    const isBlocked =
      (type === "pdf"   && pdfCount   >= limits.pdf) ||
      (type === "video" && videoCount >= limits.video) ||
      (type === "video" && videoCount >= MAX_VIDEOS_PER_MONTH && !isAdmin && plan !== 'unlimited')

    if (isBlocked) {
      const baseMsg = `Límite de ${type === "pdf" ? `${limits.pdf} PDFs` : `${limits.video} videos`} mensuales alcanzado para tu plan.`
      const extraMsg = type === 'video' && videoCount >= MAX_VIDEOS_PER_MONTH && !isAdmin && plan !== 'unlimited'
        ? ' Máximo mensual global alcanzado.'
        : ''
      return NextResponse.json(
        { error: baseMsg + extraMsg },
        { status: 429 }
      )
    }

    // Actualizar SIEMPRE el conteo
    const updates: any = {}
    if (type === "pdf")   updates.pdfCount   = pdfCount + 1
    if (type === "video") updates.videoCount = videoCount + 1

    await usageRef.set(updates, { merge: true })

    return NextResponse.json({
      success: true,
      pdfCount: updates.pdfCount ?? pdfCount,
      videoCount: updates.videoCount ?? videoCount,
      plan,
    })
  } catch (err: any) {
    console.error("❌ Error en /api/usage:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
