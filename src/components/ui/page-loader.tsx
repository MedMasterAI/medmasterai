'use client'

import Image from "next/image"
import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"

interface PageLoaderProps {
  mensaje?: string
}

export function PageLoader({ mensaje = "Cargando interfaz..." }: PageLoaderProps) {
  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      {/* Fondo visual */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/ChatGPT Image 23 de may. de 2025 22_00_26.png"
          alt="Fondo"
          fill
          style={{ objectFit: 'cover', opacity: 0.92 }}
          priority
          className="select-none pointer-events-none"
        />
        <div className="absolute inset-0 bg-[#18182970] pointer-events-none" />
      </div>

      {/* Loader */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="z-10 flex flex-col items-center gap-4"
      >
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium text-center">{mensaje}</p>
      </motion.div>
    </div>
  )
}
