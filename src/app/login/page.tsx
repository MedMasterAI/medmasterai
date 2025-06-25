"use client";

import { useEffect } from "react";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { LoginForm } from "@/components/login-form";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  useAuthRedirect();

  // Forzar modo oscuro solo para esta página
  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => document.documentElement.classList.remove("dark");
  }, []);

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
            Bienvenidos a MedMasterAI
          </h1>
          <p className="text-sm text-muted-foreground text-center">
            ¿Aún no tienes cuenta?{" "}
            <Link href="/register" className="underline">
              Regístrate aquí
            </Link>{" "}
            para crear tu cuenta sin Google ni Apple.
          </p>
        </div>
        <LoginForm />
        <p className="text-center text-sm">
          ¿Olvidaste tu contraseña?{" "}
          <Link href="/reset-password" className="underline">
            Recupérala aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
