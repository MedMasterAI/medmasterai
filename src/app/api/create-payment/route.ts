// src/app/api/create-payment/route.ts
import { NextResponse } from "next/server"
import { preference } from "@/lib/mercadopago"
import { PLAN_DETAILS } from "@/lib/plans"

export async function POST(request: Request) {
  try {
    const { plan, uid } = (await request.json()) as {
      plan?: keyof typeof PLAN_DETAILS
      uid?: string
    }
    if (!plan || !uid || !PLAN_DETAILS[plan]) {
      return NextResponse.json({ error: "Falta plan o uid" }, { status: 400 })
    }

    const origin = new URL(request.url).origin
    const details = PLAN_DETAILS[plan]

    const payload = {
      items: [
        {
          title: details.name,
          quantity: 1,
          currency_id: "ARS",
          unit_price: details.priceARS,
        },
      ],
      back_urls: {
        success: `${origin}/pagos?pagado=true`,
        pending: `${origin}/pagos?pagado=pending`,
        failure: `${origin}/pagos?pagado=false`,
      },
      external_reference: uid,
    }

    const pref = await preference.create({ body: payload })
    // Extraemos ambos puntos de inicio
    const { init_point, sandbox_init_point } = pref
    // En development usamos sandbox, en producción el init_point real.
    const redirectUrl =
      process.env.NODE_ENV === "development"
        ? sandbox_init_point
        : init_point

    return NextResponse.json({ init_point: redirectUrl })
  } catch (err: any) {
    console.error("💥 create-payment error:", err)
    return NextResponse.json(
      { error: err.message || "Error interno del servidor" },
      { status: 500 }
    )
  }
}
