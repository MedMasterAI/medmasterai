// src/components/auth/PremiumOnly.tsx
"use client"

import { useAuth } from "@/hooks/useAuth"
import { useUserPlan } from "@/hooks/useUserPlan"

export function PremiumOnly({ children, fallback }: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { user } = useAuth()
  const { plan, isActive } = useUserPlan(user?.uid ?? null)

  if (!user) return null
  // Solo usuarios con plan activo y distinto de "free" acceden
  if (!isActive || plan === "free") return fallback ?? (
    <p className="text-sm text-muted-foreground">🔒 Función disponible solo para usuarios PRO o ILIMITADO</p>
  )

  return <>{children}</>
}
