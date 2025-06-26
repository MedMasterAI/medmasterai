// src/lib/refundPolicy.ts
import mercadopago from './mercadopago'

const MAX_DAYS_REFUND = 7

/**
 * Verifica si un pago es elegible para reembolso según las políticas de la app.
 */
export async function canRefund(paymentId: string) {
  const payment = await mercadopago.payment.findById(paymentId)
  const body = payment.body

  if (!body || body.status !== 'approved') {
    return { ok: false, reason: 'Pago no aprobado' }
  }

  const created = new Date(body.date_created).getTime()
  const days = (Date.now() - created) / (1000 * 60 * 60 * 24)
  if (days > MAX_DAYS_REFUND) {
    return { ok: false, reason: 'Fuera de ventana de reembolso' }
  }

  if (body.refunds && body.refunds.length > 0) {
    return { ok: false, reason: 'Pago ya reembolsado' }
  }

  return { ok: true }
}
