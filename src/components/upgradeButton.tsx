"use client"
import { useState } from "react"
import { getAuth, getIdToken } from "firebase/auth"

type UpgradeButtonProps = {
  plan: "pro" | "unlimited"
}

export function UpgradeButton({ plan }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const auth = getAuth()
      const user = auth.currentUser!
      const token = await getIdToken(user)

      const resp = await fetch("/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan, uid: user.uid }),
      })

      const data = await resp.json()
      if (!resp.ok) {
        throw new Error(data.error || "Error desconocido")
      }

      // Redirigimos al checkout (MercadoPago/Stripe)
      window.location.href = data.init_point
    } catch (e: any) {
      console.error("Error al crear pago:", e)
      alert(`No se pudo iniciar el pago: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="px-4 py-2 bg-blue-600 text-white rounded w-full"
    >
      {loading ? "Cargando…" : `Actualizar a ${plan === "pro" ? "PRO" : "ILIMITADO"}`}
    </button>
  )
}
