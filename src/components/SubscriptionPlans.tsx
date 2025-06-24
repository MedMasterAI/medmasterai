"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { UpgradeButton } from "./upgradeButton"

const plans = [
  {
    key: "free",
    title: "GRATIS",
    price: "$0",
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
    price: "$3000",
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
    price: "$5000",
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
          className={`border-2 transition-transform hover:scale-105 hover:shadow-xl animate-in fade-in-0 slide-in-from-bottom-4 ${
            plan.highlight
              ? "border-primary ring-2 ring-primary-light"
              : "border-border"
          }`}
        >
          <CardHeader
            className={`${
              plan.highlight
                ? "bg-primary text-primary-foreground"
                : "bg-gradient-to-br from-white to-secondary-light text-foreground"
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
                      plan.highlight ? "text-primary-foreground" : "text-primary-dark"
                    }`}
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
                  className="w-full bg-gray-100 text-gray-500 cursor-default"
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
