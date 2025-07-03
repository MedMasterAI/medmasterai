import { NextResponse } from 'next/server'
import { consumeCredit } from '@/lib/credits'

export async function POST(req: Request) {
  try {
    const { uid, type } = await req.json() as { uid: string; type: 'pdf' | 'video' }
    if (!uid || (type !== 'pdf' && type !== 'video')) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }
    const credits = await consumeCredit(uid, type)
    return NextResponse.json({ success: true, credits })
  } catch (err: any) {
    console.error('❌ Error al consumir crédito:', err)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
