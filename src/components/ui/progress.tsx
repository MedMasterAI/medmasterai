// src/components/ui/progress.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    const percentage = Math.min((value / max) * 100, 100)

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-muted",
          "shadow-sm transition-all duration-300 ease-in-out",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "absolute left-0 top-0 h-full rounded-full bg-gradient-to-r",
            "from-[var(--progress-from)] via-[var(--progress-via)] to-[var(--progress-to)]",
            "transition-[width] duration-500 ease-in-out"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    )
  }
)

Progress.displayName = "Progress"

export { Progress }