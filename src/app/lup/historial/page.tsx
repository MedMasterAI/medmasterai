'use client'

import Link from 'next/link'
import { useAuth } from '@/authcontext'
import { useUserLupPlans } from '@/hooks/useUserLupPlans'
import { Button } from '@/components/ui/button'

export default function LupHistorialPage() {
  const { user } = useAuth()
  const { plans, loading } = useUserLupPlans(user?.uid ?? null)

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Historial de planes</h1>
      {loading && <p>Cargando...</p>}
      {!loading && plans.length === 0 && <p>No hay planes guardados.</p>}
      {!loading && plans.length > 0 && (
        <ul className="space-y-4">
          {plans.map((p) => (
            <li key={p.id} className="border rounded-md p-3">
              <div className="flex justify-between">
                <span className="font-medium">
                  {new Date(p.createdAt).toLocaleString()}
                </span>
              </div>
              <pre className="whitespace-pre-wrap text-sm mt-2">
                {JSON.stringify(p.plan, null, 2)}
              </pre>
            </li>
          ))}
        </ul>
      )}
      <Button asChild variant="secondary">
        <Link href="/lup">Volver</Link>
      </Button>
    </div>
  )
}
