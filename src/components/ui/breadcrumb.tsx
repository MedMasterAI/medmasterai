"use client"

import * as React from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function Breadcrumb({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn("w-full flex items-center text-sm font-medium", className)}
      aria-label="Breadcrumb"
      {...props}
    >
      {children}
    </nav>
  )
}

export function BreadcrumbList({ children, className, ...props }: React.HTMLAttributes<HTMLOListElement>) {
  return (
    <ol className={cn("flex flex-wrap items-center gap-1", className)} {...props}>
      {children}
    </ol>
  )
}

export function BreadcrumbItem({ children, className, ...props }: React.LiHTMLAttributes<HTMLLIElement>) {
  return (
    <li className={cn("flex items-center", className)} {...props}>
      {children}
    </li>
  )
}

export function BreadcrumbLink({ children, className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={cn("text-muted-foreground hover:text-foreground transition-colors", className)}
      {...props}
    >
      {children}
    </a>
  )
}

export function BreadcrumbSeparator({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span role="presentation" className={cn("px-1 text-muted-foreground", className)} {...props}>
      <ChevronRight className="w-4 h-4" />
    </span>
  )
}