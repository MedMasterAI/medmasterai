// src/lib/mpPayments.ts
import { mp } from './mercadopago'

export async function createPaymentLink(
  title: string,
  amount: number,
  uid: string,
  backUrls: { success: string; failure: string }
) {
  const pref = await mp.preferences.create({
    items: [{ title, quantity: 1, currency_id: 'ARS', unit_price: amount }],
    back_urls: backUrls,
    auto_return: 'approved',
    external_reference: uid,
  })
  return pref.body.init_point
}

export async function getPaymentStatus(paymentId: string) {
  const payment = await mp.payment.findById(paymentId)
  return payment.body
}

export async function cancelPayment(paymentId: string) {
  return mp.payment.cancel(paymentId)
}

export async function refundPayment(paymentId: string, amount?: number) {
  return mp.payment.refund(paymentId, amount ? { amount } : undefined)
}
