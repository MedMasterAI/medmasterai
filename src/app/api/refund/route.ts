import { NextResponse } from 'next/server'
import { refundPayment } from '@/lib/mpPayments'
import { canRefund } from '@/lib/refundPolicy'
import { logAction } from '@/lib/logger'

export async function POST(req: Request) {
  try {
    const { paymentId, amount } = await req.json()
    const { ok, reason } = await canRefund(paymentId)
    if (!ok) {
      await logAction('refund_denied', { paymentId, reason })
      return NextResponse.json({ error: reason }, { status: 400 })
    }
    await refundPayment(paymentId, amount)
    await logAction('refund_processed', { paymentId, amount })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Error in refund', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
