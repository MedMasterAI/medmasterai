'use client'

import Image from "next/image"
import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"

interface PageLoaderProps {
  mensaje?: string
}

export function PageLoader({ mensaje = "Cargando interfaz..." }: PageLoaderProps) {
  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-background text-foreground">
      
      {/* Fondo visual estilizado */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/ChatGPT Image 23 de may. de 2025 22_00_26.png"
          alt="Fondo visual"
          fill
          className="object-cover opacity-90 select-none pointer-events-none"
          priority
        />
        {/* Overlay oscuro translúcido (modo oscuro + efecto calmado) */}
        <div className="absolute inset-0 bg-[rgba(20,16,31,0.6)] dark:bg-[rgba(0,0,0,0.6)] pointer-events-none" />
      </div>

      {/* Cargador central */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="z-10 flex flex-col items-center gap-4"
      >
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-muted-foreground text-sm font-medium text-center">{mensaje}</p>
      </motion.div>
    </div>
  )
}