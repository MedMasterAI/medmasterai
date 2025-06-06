import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          // Efecto glassy, transiciones y focus ring pro
          `
          flex h-10 w-full rounded-lg border border-input
          bg-background/80 dark:bg-[#23243ab8] shadow-sm
          px-3 py-2 text-sm transition-all
          placeholder:text-muted-foreground
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          focus:ring-offset-background
          disabled:cursor-not-allowed disabled:opacity-50
          file:border-0 file:bg-transparent file:text-sm file:font-medium
          backdrop-blur-[2px]
          hover:shadow-md
          `,
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }