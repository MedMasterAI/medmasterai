import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from 'firebase-admin/auth'
import { consumeCredit } from '@/lib/credits'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || ''
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 401 })
    }

    const idToken = authHeader.split(' ')[1]
    let decoded
    try {
      decoded = await getAuth().verifyIdToken(idToken)
    } catch (err) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const { uid, type } = await req.json() as { uid: string; type: 'pdf' | 'video' }
    if (!uid || (type !== 'pdf' && type !== 'video')) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    if (decoded.uid !== uid) {
      return NextResponse.json({ error: 'UID no coincide' }, { status: 403 })
    }

    const credits = await consumeCredit(uid, type)
    return NextResponse.json({ success: true, credits })
  } catch (err: any) {
    console.error('❌ Error al consumir crédito:', err)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
