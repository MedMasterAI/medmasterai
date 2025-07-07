'use client'
import { useState } from 'react'
import { useRequireAdmin } from '@/hooks/useRequireAdmin'

export default function ReporteFiscalPage() {
  const user = useRequireAdmin()
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [url, setUrl] = useState<string | null>(null)

  if (!user) {
    return <div className="p-8">Cargando…</div>
  }

  const handle = async () => {
    const token = await user.getIdToken()
    const res = await fetch('/api/fiscal-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ month, year })
    })
    if (res.ok) {
      const blob = await res.blob()
      setUrl(URL.createObjectURL(blob))
    } else {
      alert('Error al generar reporte')
    }
  }

  return (
    <main className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Reporte Fiscal</h1>
      <div className="flex gap-2 items-end">
        <div>
          <label className="block text-sm">Mes</label>
          <input type="number" value={month} min={1} max={12} onChange={e => setMonth(Number(e.target.value))} className="border p-1" />
        </div>
        <div>
          <label className="block text-sm">Año</label>
          <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} className="border p-1" />
        </div>
        <button onClick={handle} className="px-4 py-2 bg-primary text-white rounded">Generar</button>
      </div>
      {url && (
        <a href={url} download={`reporte-${year}-${month}.pdf`} className="text-primary underline">Descargar PDF</a>
      )}
    </main>
  )
}
