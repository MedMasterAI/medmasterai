"use client"
import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { collection, query, orderBy, onSnapshot } from "firebase/firestore"
import { getFirestoreDb } from "@/lib/firebase"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface Refund {
  paymentId: string
  amount: number
  timestamp: any
}

export default function ConfigPage() {
  const { user } = useAuth()
  const [refunds, setRefunds] = useState<Refund[]>([])

  useEffect(() => {
    if (!user) return
    const ref = collection(getFirestoreDb(), "users", user.uid, "refunds")
    const q = query(ref, orderBy("timestamp", "desc"))
    const unsub = onSnapshot(q, snap => {
      setRefunds(snap.docs.map(d => d.data() as Refund))
    })
    return unsub
  }, [user])

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <h1 className="text-2xl font-bold">Configuraci\u00f3n</h1>
      <Card>
        <CardHeader>
          <CardTitle>Historial de reembolsos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {refunds.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay reembolsos registrados.</p>
          ) : (
            <ul className="space-y-2">
              {refunds.map((r, i) => (
                <li key={i} className="flex justify-between border rounded-md p-2">
                  <span>Pago {r.paymentId}</span>
                  <span className="font-medium">${'{'}r.amount{'}'}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="pt-4 text-right">
            <Link href="/dashboard/config/asistente" className="text-primary hover:underline">
              Ir al Asistente
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

