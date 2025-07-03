"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithGoogle,
  signInWithApple,
  getFirebaseAuth,
} from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ensureUserDocWithFreePlan } from "@/lib/ensureUserDocWithFreePlan";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { isEmailAllowed } from "@/lib/emailFilter";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPass, setShowPass] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const redirectToDashboard = () => {
    router.replace("/dashboard");
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const userCredential = await signInWithGoogle();
      const user = userCredential.user;
      if (!user.uid) throw new Error("No se pudo obtener el UID");
      await ensureUserDocWithFreePlan(user.uid, user.email ?? undefined);
      toast.success("✅ ¡Bienvenido con Google!");
      redirectToDashboard();
    } catch (err) {
      console.error(err);
      toast.error("Error al iniciar con Google");
    } finally {
      setLoading(false);
    }
  };

  const handleApple = async () => {
    setLoading(true);
    try {
      const userCredential = await signInWithApple();
      const user = userCredential.user;
      if (!user.uid) throw new Error("No se pudo obtener el UID");
      await ensureUserDocWithFreePlan(user.uid, user.email ?? undefined);
      toast.success("✅ ¡Bienvenido con Apple!");
      redirectToDashboard();
    } catch (err) {
      console.error(err);
      toast.error("Error al iniciar con Apple");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isEmailAllowed(email)) {
      toast.error("Solo se permiten correos Gmail, Outlook, Hotmail, etc.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        getFirebaseAuth(),
        email,
        password,
      );
      const user = userCredential.user;
      if (!user.uid) throw new Error("No se pudo obtener el UID");
      await ensureUserDocWithFreePlan(user.uid, user.email ?? undefined);
      toast.success("✅ ¡Bienvenido!");
      redirectToDashboard();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error al iniciar con email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleEmailLogin} className="flex flex-col gap-6">
        <div className="grid gap-3">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-label={
                  showPass ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPass ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Cargando…" : "Iniciar con Email"}
        </Button>
      </form>

      <div className="relative text-center text-sm">
        <span className="bg-background px-2 relative z-10">o</span>
        <div className="absolute inset-0 top-1/2 border-t" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Button
          variant="secondary"
          type="button"
          onClick={handleApple}
          disabled={loading}
          className="w-full font-semibold"
        >
          Continuar con Apple
        </Button>
        <Button
          variant="secondary"
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="w-full font-semibold"
        >
          Continuar con Google
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Al continuar, aceptas nuestros{" "}
        <a href="/terms" className="underline">
          Términos
        </a>{" "}
        y{" "}
        <a href="/privacy" className="underline">
          Política de Privacidad
        </a>
        .
      </p>
    </div>
  );
}
