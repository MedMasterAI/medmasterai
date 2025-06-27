// src/lib/mercadopago.ts
import mercadopago from "mercadopago"

// Este método existe en la rama 1.x
mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN!,
})

export default mercadopago

