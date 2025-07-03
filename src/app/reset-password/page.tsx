"use client";

import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => document.documentElement.classList.remove("dark");
  }, []);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), email);
      toast.success("Se envió un enlace a tu correo");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error al enviar correo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background text-foreground transition-colors duration-300 px-4 py-12">
      <Image
        src="/322.png"
        alt="Fondo decorativo"
        fill
        className="absolute inset-0 object-cover opacity-30 z-0"
      />
      <div className="z-10 w-full max-w-md space-y-6 rounded-xl bg-card/80 p-8 shadow-xl backdrop-blur-lg">
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/logo2.png"
            alt="MedMaster logo"
            width={120}
            height={40}
          />
          <h1 className="text-2xl font-semibold text-center text-foreground">
            Recuperar contraseña
          </h1>
          <p className="text-sm text-muted-foreground text-center">
            Ingresa tu email para recibir un enlace de recuperación.
          </p>
        </div>
        <form onSubmit={handleReset} className="flex flex-col gap-6">
          <div className="grid gap-3">
            <div>
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Enviando…" : "Enviar enlace"}
          </Button>
        </form>
        <p className="text-center text-sm">
          <Link href="/login" className="underline">
            Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
