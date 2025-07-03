import { NextResponse } from 'next/server'
import { getPaymentStatus } from '@/lib/mpPayments'
import { logAction } from '@/lib/logger'

export async function POST(req: Request) {
  try {
    const { paymentId } = await req.json()
    const info = await getPaymentStatus(paymentId)
    await logAction('check_payment_status', { paymentId, status: info.status })
    return NextResponse.json({ status: info.status, detail: info })
  } catch (err: any) {
    console.error('Error in payment-status', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
