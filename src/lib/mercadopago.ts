// src/lib/mercadopago.ts
import MercadoPago from "mercadopago";

// Crea una instancia, pasando el access token
export const mp = new MercadoPago({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

export default mp;