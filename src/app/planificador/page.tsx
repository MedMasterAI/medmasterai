'use client'

import { useState } from 'react'
import { useStudyPlan } from '@/hooks/useStudyPlan'
import { Button } from '@/components/ui/button'

export default function PlanificadorPage() {
  const { plan, setPlan } = useStudyPlan()
  const [loading, setLoading] = useState(false)

  async function actualizar() {
    if (!plan) return
    setLoading(true)
    try {
      const res = await fetch('/api/study-plan/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan)
      })
      const data = await res.json()
      if (data.plan) setPlan(data.plan)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Planificador Inteligente</h1>
      {plan ? (
        <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
          {JSON.stringify(plan, null, 2)}
        </pre>
      ) : (
        <p>No hay plan guardado. Empez\u00e1 cargando tus materias.</p>
      )}
      <Button onClick={actualizar} disabled={!plan || loading}>
        {loading ? 'Actualizando...' : 'Actualizar con IA'}
      </Button>
    </div>
  )
}
