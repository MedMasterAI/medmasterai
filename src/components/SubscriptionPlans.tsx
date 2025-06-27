"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { UpgradeButton } from "./upgradeButton"
import { PLAN_DETAILS } from "@/lib/plans"

const plans = [
  {
    key: "free",
    title: "GRATIS",
    price: `$${PLAN_DETAILS.free.priceARS}`,
    billed: "para siempre",
    features: [
      "1 PDF al día",
      "1 video al día",
      "Funciones básicas de estudio",
    ],
    highlight: false,
  },
  {
    key: "pro",
    title: "PLUS",
    price: `$${PLAN_DETAILS.pro.priceARS}`,
    billed: "por mes",
    features: [
      "15 PDFs al mes",
      "20 videos por mes",
      "Chat avanzado",
      "Generación de podcasts",
      "Notas más rápidas y de mayor calidad",
      "Acceso anticipado a nuevas funciones",
    ],
    highlight: false,
  },
  {
    key: "unlimited",
    title: "ILIMITADO",
    price: `$${PLAN_DETAILS.unlimited.priceARS}`,
    billed: "por mes",
    features: [
      "PDFs ilimitados",
      "Videos ilimitados",
      "Chat pro-mode ilimitado",
      "Generación de podcasts sin límite",
      "Notas más rápidas y premium",
      "Acceso a beta de modo voz avanzado",
      "Soporte prioritario",
    ],
    highlight: true,
  },
]

export function SubscriptionPlans() {
  return (
    <div className="max-w-5xl mx-auto py-8 grid md:grid-cols-3 gap-8">
      {plans.map((plan) => (
        <Card
          key={plan.key}
          className={`overflow-hidden rounded-2xl border transition-transform hover:scale-105 hover:shadow-xl ${
            plan.highlight ? "border-primary shadow-lg" : "border-border"
          }`}
        >
          <CardHeader
            className={`text-center ${
              plan.highlight
                ? "bg-primary text-primary-foreground"
                : "bg-muted dark:bg-muted/40 text-foreground"
            }`}
          >
            <CardTitle className="text-2xl">{plan.title}</CardTitle>
            <p className="mt-1 text-4xl font-bold">{plan.price}</p>
            <p className="text-sm opacity-80">{plan.billed}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {plan.features.map((feat) => (
                <li key={feat} className="flex items-start">
                  <Check
                    className={`mt-[3px] mr-2 ${
                      plan.highlight ? "text-primary-foreground" : "text-primary"
                    } dark:text-primary`}
                    size={16}
                  />
                  <span className="text-sm">{feat}</span>
                </li>
              ))}
            </ul>
            <div className="pt-4">
              {plan.key === "free" ? (
                <Button
                  disabled
                  className="w-full bg-gray-100 text-gray-500 dark:bg-card dark:text-gray-400 cursor-default"
                >
                  Plan actual
                </Button>
              ) : (
                <UpgradeButton plan={plan.key as "pro" | "unlimited"} />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
