import { NextResponse } from 'next/server'
import { getAuth } from 'firebase-admin/auth'

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || ''
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 401 })
    }
    const token = authHeader.split(' ')[1]
    const decoded = await getAuth().verifyIdToken(token)
    const adminEmail = process.env.ADMIN_EMAIL
    if (!adminEmail || decoded.email !== adminEmail) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json({ isAdmin: true })
  } catch (err) {
    console.error('is-admin error', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
