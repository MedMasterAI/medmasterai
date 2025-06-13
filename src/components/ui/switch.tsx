"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-[1.25rem] w-[2.25rem] items-center rounded-full border border-transparent shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-50 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/70",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "block size-[1rem] rounded-full bg-background ring-0 transition-transform duration-200 translate-x-0 data-[state=checked]:translate-x-[1.05rem] dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }