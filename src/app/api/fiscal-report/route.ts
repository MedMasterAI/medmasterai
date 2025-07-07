import { NextResponse } from 'next/server'
import { getAuth } from 'firebase-admin/auth'
import { generateReport } from '@/lib/fiscalReport'

export const runtime = 'nodejs'

export async function POST(req: Request) {
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
    const { month, year } = await req.json()
    if (!month || !year) {
      return NextResponse.json({ error: 'Mes y año requeridos' }, { status: 400 })
    }
    const pdf = await generateReport(Number(month), Number(year))
    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="reporte-${year}-${month}.pdf"`
      }
    })
  } catch (err) {
    console.error('fiscal-report error', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
