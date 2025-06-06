// src/components/progreso-chunks.tsx
"use client"

import { Progress } from "@/components/ui/progress"

type Props = {
  total: number
  current: number
}

export function ProgresoChunks({ total, current }: Props) {
  const porcentaje = (current / total) * 100

  return (
    <div className="w-full mt-6">
      <p className="text-sm text-muted-foreground mb-1">
        Procesando chunk {current} de {total}
      </p>
      <Progress value={porcentaje} />
    </div>
  )
}
