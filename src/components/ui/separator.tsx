import * as React from "react"
import { cn } from "@/lib/utils"

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Separator({ className, ...props }: SeparatorProps) {
  return (
    <div
      role="separator"
      className={cn(
        "my-2 h-px w-full bg-border/80 backdrop-blur-[2px]", // leve glassy y opacidad
        className
      )}
      {...props}
    />
  )
}