import { NextRequest, NextResponse } from "next/server";
import mercadopago from "@/lib/mercadopago";

export async function POST(req: NextRequest) {
  const { plan, uid } = await req.json();
  const origin = req.headers.get("origin") || "";
  const preference = await mercadopago.preferences.create({
    items: [
      {
        title: plan === "pro" ? "Plus Mensual" : "Ilimitado Mensual",
        quantity: 1,
        currency_id: "ARS",
        unit_price: plan === "pro" ? 500 : 1000,
      },
    ],
    back_urls: {
      success: `${origin}/dashboard?pagado=true`,
      failure: `${origin}/dashboard?pagado=false`,
    },
    auto_return: "approved",
    external_reference: uid,
  });

  return NextResponse.json({ init_point: preference.body.init_point });
}
