import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

export const buttonVariants = cva(
  "inline-flex items-center justify-center font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-dark",
        outline: "border border-border text-foreground hover:bg-accent-2",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary-dark",
        ghost: "bg-transparent text-foreground hover:bg-accent-2",
        link: "text-primary underline-offset-4 hover:underline",
        destructive: "bg-error text-primary-foreground hover:bg-error/80",
      },
      size: {
        sm: "h-9 px-3 rounded-md text-sm",
        md: "h-11 px-4 rounded-lg",
        lg: "h-12 px-6 rounded-xl text-base",
        icon: "h-11 w-11 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"
