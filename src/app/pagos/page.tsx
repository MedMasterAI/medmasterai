"use client"


import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { onUserChanged, signOut } from "@/lib/firebase"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { SubscriptionPlans } from "@/components/SubscriptionPlans"
import { CheckCircle, AlertTriangle, XCircle, LogOut, Star } from "lucide-react"
import { useUserPlan } from "@/hooks/useUserPlan"

export default function PagosPage() {
  const router = useRouter()
  const params = useSearchParams()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const status = params.get("pagado")

  useEffect(() => {
    const unsub = onUserChanged((u) => {
      setUserEmail(u?.displayName ?? u?.email ?? null)
      setUserId(u?.uid ?? null)
      setLoading(false)
      if (!u) router.push("/login")
    })
    return () => unsub()
  }, [router])

  // 👉 Hook unificado para saber el plan del usuario
  const { plan, isActive, daysLeft } = useUserPlan(userId)

  if (loading) return <div className="p-8 text-center text-muted-foreground">Cargando…</div>

  // Helper para mensaje según plan
  function getPlanName(plan: string) {
    if (plan === "pro") return "PLUS"
    if (plan === "unlimited") return "ILIMITADO"
    return "FREE"
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Encabezado con fondo atractivo */}
      <div className="relative h-40 md:h-52 w-full flex items-center justify-center text-white mb-6 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600">
        <div className="text-center space-y-1 px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold drop-shadow-sm">Gestión de pagos</h1>
          <p className="text-sm md:text-base text-white/90 max-w-xl mx-auto">
            Actualizá tu plan y revisá el estado de tus pagos.
          </p>
        </div>
      </div>
      <Card className="mx-auto w-full max-w-4xl animate-in fade-in-0 slide-in-from-bottom-4 shadow-lg ring-1 ring-primary/10">
        <CardHeader>
          <CardTitle className="text-2xl">Facturación</CardTitle>
          <CardDescription>
            Hola, <span className="font-semibold">{userEmail}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Notificaciones de estado de pago */}
          {status === "true" && (
            <div className="flex items-center gap-3 p-4 rounded-md bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-200">
              <CheckCircle className="w-5 h-5" />
              <p>¡Pago exitoso! Tu suscripción está activa.</p>
            </div>
          )}
          {status === "false" && (
            <div className="flex items-center gap-3 p-4 rounded-md bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-200">
              <XCircle className="w-5 h-5" />
              <p>El pago no se completó. Inténtalo de nuevo.</p>
            </div>
          )}
          {status === "pending" && (
            <div className="flex items-center gap-3 p-4 rounded-md bg-yellow-100 text-yellow-800 dark:bg-yellow-700/20 dark:text-yellow-200">
              <AlertTriangle className="w-5 h-5" />
              <p>Pago pendiente. Te notificaremos cuando se confirme.</p>
            </div>
          )}

          {/* Estado de suscripción actual */}
          {isActive && plan !== "free" && (
            <div className="flex items-center gap-3 p-4 rounded-md bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-700">
              <Star className="w-5 h-5 fill-blue-500" />
              <p>
                Ya estás en el plan <strong>{getPlanName(plan)}</strong>
                {daysLeft > 0 ? <>. Te quedan <strong>{daysLeft}</strong> días de suscripción.</> : null}
                ¡Gracias por apoyar MedMaster!
              </p>
            </div>
          )}

          <p className="text-muted-foreground text-sm leading-relaxed">
            Con nuestros planes PLUS o ILIMITADO accedés a <strong className="text-foreground">todas las funciones</strong> sin restricciones.
          </p>

          {/* Plan de suscripción */}
          {!isActive || plan === "free" ? <SubscriptionPlans /> : null}

          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t">
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Volver al Dashboard
            </Button>
            <Button variant="destructive" onClick={async () => {
              await signOut()
              router.push("/login")
            }}>
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
