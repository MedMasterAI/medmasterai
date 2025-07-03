import { NextResponse } from 'next/server'
import { createPaymentLink } from '@/lib/mpPayments'
import { logAction } from '@/lib/logger'

export async function POST(req: Request) {
  try {
    const { title, amount, uid } = await req.json()
    const origin = req.headers.get('origin') || ''
    const link = await createPaymentLink(title, amount, uid, {
      success: `${origin}/dashboard?pagado=true`,
      failure: `${origin}/dashboard?pagado=false`,
    })
    await logAction('create_payment_link', { uid, title, amount })
    return NextResponse.json({ init_point: link })
  } catch (err: any) {
    console.error('Error in create-payment-link', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
