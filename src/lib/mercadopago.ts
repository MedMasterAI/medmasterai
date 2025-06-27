// src/lib/mercadopago.ts
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'
// Cliente configurado para el SDK v2
const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
})

// Instancias listas para usar en el resto de la app
export const preference = new Preference(mpClient)
export const payment = new Payment(mpClient)

