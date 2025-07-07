import axios from 'axios'
import { htmlToPdf } from './pdf/htmlToPdf'

export interface Movement {
  id: string
  description: string
  date: string
  amount: number
  fee: number
  net: number
}

export interface Summary {
  totalIncome: number
  totalFees: number
  netTotal: number
}

function getMonthRange(month: number, year: number) {
  const start = new Date(Date.UTC(year, month - 1, 1))
  const end = new Date(Date.UTC(year, month, 1))
  return { start, end }
}

export async function fetchMovements(month: number, year: number): Promise<Movement[]> {
  const { start, end } = getMonthRange(month, year)
  const url = 'https://api.mercadopago.com/v1/payments/search'
  const res = await axios.get(url, {
    params: {
      range: 'date_created',
      begin_date: start.toISOString(),
      end_date: end.toISOString(),
      sort: 'date_created',
      criteria: 'desc'
    },
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
  })
  const results = res.data.results || []
  return results.map((r: any) => {
    const t = r.transaction_details || {}
    const fee = t.total_fee || t.financing_fee || 0
    const amount = t.total_paid_amount || r.transaction_amount || 0
    const net = t.net_received_amount || amount - fee
    return {
      id: String(r.id),
      description: r.description || '',
      date: r.date_created,
      amount,
      fee,
      net
    }
  })
}

export function summarize(movements: Movement[]): Summary {
  return movements.reduce(
    (acc, m) => {
      acc.totalIncome += m.amount
      acc.totalFees += m.fee
      acc.netTotal += m.net
      return acc
    },
    { totalIncome: 0, totalFees: 0, netTotal: 0 } as Summary
  )
}

export async function last12MonthsTotal(): Promise<number> {
  const end = new Date()
  const start = new Date()
  start.setMonth(end.getMonth() - 11)
  const url = 'https://api.mercadopago.com/v1/payments/search'
  const res = await axios.get(url, {
    params: {
      range: 'date_created',
      begin_date: start.toISOString(),
      end_date: end.toISOString()
    },
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
  })
  const results = res.data.results || []
  return results.reduce((sum: number, r: any) => sum + (r.transaction_amount || 0), 0)
}

function buildHtml(month: number, year: number, summary: Summary, movements: Movement[], annual: number) {
  const rows = movements
    .map(m => `<tr><td>${new Date(m.date).toLocaleDateString()}</td><td>${m.description}</td><td>${m.amount.toFixed(2)}</td><td>${m.fee.toFixed(2)}</td><td>${m.net.toFixed(2)}</td></tr>`) 
    .join('')
  return `
    <h1>Reporte fiscal ${month}/${year}</h1>
    <p>Total ingresos: $${summary.totalIncome.toFixed(2)}</p>
    <p>Comisiones: $${summary.totalFees.toFixed(2)}</p>
    <p>Total neto: $${summary.netTotal.toFixed(2)}</p>
    <p>Total últimos 12 meses: $${annual.toFixed(2)}</p>
    <table border="1" cellspacing="0" cellpadding="4">
      <thead><tr><th>Fecha</th><th>Descripción</th><th>Monto</th><th>Comisión</th><th>Neto</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `
}

export async function generateReport(month: number, year: number): Promise<Uint8Array> {
  const movements = await fetchMovements(month, year)
  const summary = summarize(movements)
  const annual = await last12MonthsTotal()
  const html = buildHtml(month, year, summary, movements, annual)
  return htmlToPdf(html)
}
