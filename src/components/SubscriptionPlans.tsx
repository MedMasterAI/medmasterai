"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { UpgradeButton } from "./upgradeButton"
import { PLANS, PLAN_DETAILS } from "@/lib/plans"
import { useAuth } from "@/hooks/useAuth"
import { useUserPlan } from "@/hooks/useUserPlan"

const PLAN_FEATURES: Record<string, string[]> = {
  free: ["2 PDFs", "1 video", "Marca de agua"],
  basic: ["5 PDFs", "5 videos"],
  pro: ["20 PDFs", "20 videos"],
  express: ["3 PDFs", "2 videos", "Vence en 1 día"],
  extra: ["5 videos adicionales"],
  unlimited: ["Sin límites", "Soporte prioritario"],
}

export function SubscriptionPlans() {
  const { user } = useAuth()
  const { isAdmin } = useUserPlan(user?.uid ?? null)
  const plans = [...PLANS]
  if (isAdmin) {
    plans.push({
      id: 'unlimited',
      label: PLAN_DETAILS.unlimited.name,
      videos: Infinity,
      pdfs: Infinity,
      price: PLAN_DETAILS.unlimited.priceARS,
    } as any)
  }
  return (
    <div className="max-w-5xl mx-auto py-8 grid md:grid-cols-3 gap-8">
      {plans.map((plan) => (
        <Card
          key={plan.id}
          className={`overflow-hidden rounded-2xl border transition-transform hover:scale-105 hover:shadow-xl ${
            plan.id === 'unlimited' ? 'border-primary shadow-lg' : 'border-border'
          }`}
        >
          <CardHeader
            className={`text-center ${
              plan.id === 'unlimited'
                ? "bg-primary text-primary-foreground"
                : "bg-muted dark:bg-muted/40 text-foreground"
            }`}
          >
            <CardTitle className="text-2xl">{plan.label}</CardTitle>
            <p className="mt-1 text-4xl font-bold">${'`$${plan.price}`'}</p>
            <p className="text-sm opacity-80">{plan.id === 'express' ? 'por día' : plan.id === 'free' ? 'para siempre' : 'por pack'}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {PLAN_FEATURES[plan.id]?.map((feat) => (
                <li key={feat} className="flex items-start">
                  <Check
                    className={`mt-[3px] mr-2 ${
                      plan.id === 'unlimited' ? "text-primary-foreground" : "text-primary"
                    } dark:text-primary`}
                    size={16}
                  />
                  <span className="text-sm">{feat}</span>
                </li>
              ))}
            </ul>
            <div className="pt-4">
              {plan.id === "free" ? (
                <Button
                  disabled
                  className="w-full bg-gray-100 text-gray-500 dark:bg-card dark:text-gray-400 cursor-default"
                >
                  Plan actual
                </Button>
              ) : (
                <UpgradeButton plan={plan.id as any} />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
