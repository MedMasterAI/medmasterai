'use client'

import { useEffect } from 'react'
import { useAuthRedirect } from '@/hooks/useAuthRedirect'
import { SignupForm } from '@/components/signup-form'
import Image from 'next/image'
import Link from 'next/link'

export default function RegisterPage() {
  useAuthRedirect()

  useEffect(() => {
    document.documentElement.classList.add('dark')
    return () => document.documentElement.classList.remove('dark')
  }, [])

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
          <Image src="/logo2.png" alt="MedMaster logo" width={120} height={40} />
          <h1 className="text-2xl font-semibold text-center text-foreground">Crear cuenta</h1>
          <p className="text-sm text-muted-foreground text-center">
            Regístrate con tu email para comenzar a usar MedMasterAI.
          </p>
        </div>
        <SignupForm />
        <p className="text-center text-sm">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
