"use client";
import { useState } from "react";
import { getAuth, getIdToken } from "firebase/auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ERROR_CODES, formatErrorMessage } from "@/lib/errorCodes";

type UpgradeButtonProps = {
  plan: "pro" | "unlimited";
};

export function UpgradeButton({ plan }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser!;
      const token = await getIdToken(user);

      await toast.promise(
        (async () => {
          const resp = await fetch("/api/create-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ plan, uid: user.uid }),
          });

          const data = await resp.json();
          if (!resp.ok) {
            throw new Error(data.error || "Error desconocido");
          }

          // Redirigimos al checkout (MercadoPago/Stripe)
          window.location.href = data.init_point;
        })(),
        {
          loading: "Generando enlace de pago...",
          success: "Redirigiendo al pago...",
          error: () => formatErrorMessage(ERROR_CODES.PAYMENT),
        },
      );
    } catch (e: any) {
      console.error("Error al crear pago:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      className="w-full hover:scale-[1.02] transition-transform"
    >
      {loading
        ? "Cargando…"
        : `Actualizar a ${plan === "pro" ? "PLUS" : "ILIMITADO"}`}
    </Button>
  );
}
