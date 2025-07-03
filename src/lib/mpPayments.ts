// src/lib/mpPayments.ts
import { preference, payment } from './mercadopago'
export async function createPaymentLink(
  title: string,
  amount: number,
  uid: string,
  backUrls: { success: string; failure: string }
) {
  const pref = await preference.create({
    body: {
      items: [{ title, quantity: 1, currency_id: 'ARS', unit_price: amount }],
      back_urls: backUrls,
      auto_return: 'approved',
      external_reference: uid,
    },
  })
  return pref.init_point
}

export async function getPaymentStatus(paymentId: string) {
  const info = await payment.get({ id: paymentId })
  return info
}

export async function cancelPayment(paymentId: string) {
  return payment.cancel({ id: paymentId })
}

export async function refundPayment(paymentId: string, amount?: number) {
  return payment.refund({ id: paymentId, body: amount ? { amount } : undefined })
}
