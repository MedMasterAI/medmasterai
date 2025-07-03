"use client"

import { useAuth } from "@/hooks/useAuth"
import { useUserPlan } from "@/hooks/useUserPlan"
import { PlusBenefits } from "@/components/pricing/PlusBenefits"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PLAN_DETAILS } from "@/lib/plans"
import Link from "next/link"

export default function UpgradePage() {
  const { user } = useAuth()
  const { plan, isActive } = useUserPlan(user?.uid ?? null)

  return (
    <div className="max-w-xl mx-auto py-12 px-4 space-y-6">
      <h1 className="text-3xl font-bold text-center">Programado Plus 🚀</h1>

      <Card>
        <CardContent className="py-6 space-y-4">
          <p className="text-muted-foreground text-sm">
            Desbloqueá todas las funciones premium para estudiar mejor.
          </p>

          <PlusBenefits />

          {user && isActive && plan !== "free" ? (
            <p className="text-green-600 text-sm">✅ Ya sos usuario {plan === "pro" ? "PRO" : "ILIMITADO"}. ¡Gracias por apoyar!</p>
          ) : (
            <>
              <div className="text-center">
                <p className="text-2xl font-semibold">
                  ARS ${PLAN_DETAILS.pro.priceARS} / mes
                </p>
              </div>
              <form action="/pagos" method="POST">
                <input type="hidden" name="uid" value={user?.uid} />
                <Button type="submit" className="w-full">💳 Activar Programado Plus</Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>

      {!user && (
        <p className="text-sm text-center text-muted-foreground">
          Debés iniciar sesión para suscribirte.
          <br />
          <Link href="/login" className="text-blue-600 underline">Iniciar sesión</Link>
        </p>
      )}
    </div>
  )
}
