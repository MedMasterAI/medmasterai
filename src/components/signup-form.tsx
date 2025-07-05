"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { ensureUserDocWithFreePlan } from "@/lib/ensureUserDocWithFreePlan";
import { toast } from "sonner";
import { ERROR_CODES, formatErrorMessage } from "@/lib/errorCodes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { isEmailAllowed } from "@/lib/emailFilter";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirm, setConfirm] = useState<string>("");
  const [showPass, setShowPass] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const redirectToDashboard = () => {
    router.replace("/dashboard");
  };

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isEmailAllowed(email)) {
      toast.error("Correo no permitido");
      return;
    }

    if (password !== confirm) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(
        getFirebaseAuth(),
        email,
        password,
      );
      const user = cred.user;
      if (!user.uid) throw new Error("No se pudo obtener el UID");
      await ensureUserDocWithFreePlan(user.uid, user.email ?? undefined);
      toast.success("✅ ¡Cuenta creada!");
      redirectToDashboard();
    } catch (err: any) {
      console.error(err);
      toast.error(formatErrorMessage(ERROR_CODES.SIGNUP));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSignup} className="flex flex-col gap-6">
        <div className="grid gap-3">
          <div>
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
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
            <Label htmlFor="signup-password">Contraseña</Label>
            <div className="relative">
              <Input
                id="signup-password"
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
          <div>
            <Label htmlFor="signup-confirm">Confirmar contraseña</Label>
            <div className="relative">
              <Input
                id="signup-confirm"
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                value={confirm}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setConfirm(e.target.value)
                }
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-label={
                  showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showConfirm ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Cargando…" : "Crear Cuenta"}
        </Button>
      </form>
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
