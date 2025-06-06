// src/app/login/page.tsx
'use client'

import { useAuthRedirect } from '@/hooks/useAuthRedirect'
import { LoginForm } from '@/components/login-form'
import Image from 'next/image'
import Link from 'next/link'

export default function LoginPage() {useAuthRedirect()
  return (
    
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
      <Image
        src="/322.png"
        alt="Fondo decorativo"
        fill
        className="absolute inset-0 object-cover opacity-30 z-0"
      />
      <div className="z-10 w-full max-w-md space-y-6 rounded-xl bg-card/80 p-8 shadow-xl backdrop-blur-lg">
        <div className="flex flex-col items-center gap-4">
          <Image src="/logo2.png" alt="MedMaster logo" width={120} height={40} />
          <h1 className="text-2xl font-semibold text-center">Bienvenidos a MedMasterAI</h1>
          <p className="text-sm text-muted-foreground text-center">
  ¿Aún no tienes cuenta? Iniciá sesión con Google, Apple o tu email para crear tu cuenta.
</p>

        </div>
        <LoginForm />
      </div>
    </div>
  )
}
