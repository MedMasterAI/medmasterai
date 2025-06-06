// src/components/login-form.tsx
'use client'
import { ensureUserDocWithFreePlan } from "@/lib/ensureUserDocWithFreePlan"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithGoogle, signInWithApple, auth } from '@/lib/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'

const isEmailAllowed = (email: string) => {
  const allowedDomains = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com']
  const domain = email.split('@')[1]?.toLowerCase()
  return allowedDomains.includes(domain)
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const redirectToDashboard = () => {
    router.replace('/dashboard')
  }

  const handleGoogle = async () => {
    setLoading(true)
    try {
      const userCredential = await signInWithGoogle()
      const user = userCredential.user
      if (!user.uid) throw new Error("No se pudo obtener el UID")
      await ensureUserDocWithFreePlan(user.uid, user.email ?? undefined)
      toast.success('✅ ¡Bienvenido con Google!')
      redirectToDashboard()
    } catch (err) {
      console.error(err)
      toast.error('Error al iniciar con Google')
    } finally {
      setLoading(false)
    }
  }
  
  const handleApple = async () => {
    setLoading(true)
    try {
      const userCredential = await signInWithApple()
      const user = userCredential.user
      if (!user.uid) throw new Error("No se pudo obtener el UID")
      await ensureUserDocWithFreePlan(user.uid, user.email ?? undefined)
      toast.success('✅ ¡Bienvenido con Apple!')
      redirectToDashboard()
    } catch (err) {
      console.error(err)
      toast.error('Error al iniciar con Apple')
    } finally {
      setLoading(false)
    }
  }
  
  const handleEmailLogin = async (e: React.FormEvent) => {
    if (!isEmailAllowed(email)) {
      toast.error('Solo se permiten correos Gmail, Outlook, Hotmail, etc.')
      setLoading(false)
      return
    }
  
    e.preventDefault()
    setLoading(true)
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      if (!user.uid) throw new Error("No se pudo obtener el UID")
      await ensureUserDocWithFreePlan(user.uid, user.email ?? undefined)
      toast.success('✅ ¡Bienvenido!')
      redirectToDashboard()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Error al iniciar con email')
    } finally {
      setLoading(false)
    }
  }
  
  
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <form onSubmit={handleEmailLogin} className="flex flex-col gap-6">
        {/* Logo + título */}
        
         
          
          
        

        {/* Email & Password */}
        <div className="grid gap-3">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Botón Email Login */}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Cargando…' : 'Iniciar con Email'}
        </Button>
      </form>

      {/* Separador */}
      <div className="relative text-center text-sm">
        <span className="bg-background px-2 relative z-10">o</span>
        <div className="absolute inset-0 top-1/2 border-t" />
      </div>

      {/* Google / Apple */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Button
          variant="outline"
          type="button"
          onClick={handleApple}
          disabled={loading}
          className="w-full"
        >
          {/* Aquí puedes meter tu SVG de Apple */}
          Continuar con Apple
        </Button>
        <Button
          variant="outline"
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="w-full"
        >
          {/* SVG de Google */}
          Continuar con Google
        </Button>
      </div>

      {/* Pie de página */}
      <p className="text-center text-xs text-muted-foreground">
        Al continuar, aceptas nuestros{' '}
        <a href="/terms" className="underline">
          Términos
        </a>{' '}
        y{' '}
        <a href="/privacy" className="underline">
          Política de Privacidad
        </a>
        .
      </p>
    </div>
  )
}
