"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { UpgradeButton } from "./upgradeButton"

const plans = [
  {
    key: "pro",
    title: "PRO",
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
    <div className="max-w-3xl mx-auto py-8 grid md:grid-cols-2 gap-8">
      {plans.map((plan) => (
        <Card
          key={plan.key}
          className={`border-2 ${
            plan.highlight
              ? "border-indigo-500 ring-2 ring-indigo-300"
              : "border-gray-200"
          }`}
        >
          <CardHeader
            className={`${
              plan.highlight
                ? "bg-indigo-500 text-white"
                : "bg-gray-50 text-indigo-900"
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
                      plan.highlight ? "text-indigo-200" : "text-indigo-500"
                    }`}
                    size={16}
                  />
                  <span className="text-sm">{feat}</span>
                </li>
              ))}
            </ul>
            <div className="pt-4">
              {/* Podés pasar el tipo de plan al botón para checkout */}
              <UpgradeButton plan={plan.key as "pro" | "unlimited"} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
