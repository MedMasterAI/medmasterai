// pages/api/create-payment.ts
import type { NextApiRequest, NextApiResponse } from "next"
import mercadopago from "@/lib/mercadopago"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { plan, uid } = req.body
  const preference = await mercadopago.preferences.create({
    items: [
      {
        title: plan === "plus" ? "Plus Mensual" : "Premium Mensual",
        quantity: 1,
        currency_id: "ARS",
        unit_price: plan === "plus" ? 500 : 1000,
      },
    ],
    back_urls: {
      success: `${req.headers.origin}/dashboard?pagado=true`,
      failure: `${req.headers.origin}/dashboard?pagado=false`,
    },
    auto_return: "approved",
    external_reference: uid,
  })

  return res.status(200).json({ init_point: preference.body.init_point })
}
