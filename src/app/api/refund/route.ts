import { NextResponse } from 'next/server'
import { refundPayment, getPaymentStatus } from '@/lib/mpPayments'
import { canRefund } from '@/lib/refundPolicy'
import { logAction } from '@/lib/logger'
import { dbAdmin } from '@/lib/firebase-admin'

export async function POST(req: Request) {
  try {
    const { paymentId, amount } = await req.json()
    const { ok, reason } = await canRefund(paymentId)
    if (!ok) {
      await logAction('refund_denied', { paymentId, reason })
      return NextResponse.json({ error: reason }, { status: 400 })
    }
    await refundPayment(paymentId, amount)

    let uid: string | undefined
    try {
      const info = await getPaymentStatus(paymentId)
      uid = info.external_reference
      if (uid) {
        await dbAdmin
          .collection('users')
          .doc(uid)
          .collection('refunds')
          .doc(paymentId)
          .set({ amount, paymentId, timestamp: new Date() })
      }
    } catch (err) {
      console.error('Failed to record refund', err)
    }

    await logAction('refund_processed', { paymentId, amount, uid })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Error in refund', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

