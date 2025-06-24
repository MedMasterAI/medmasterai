// src/components/dashboard/CardItem.tsx
"use client";

import Link from "next/link"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface CardItemProps {
  href: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
}

export default function CardItem({
  href,
  icon: Icon,
  title,
  description,
  className,
}: CardItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group bg-card border border-card-border shadow-card rounded-2xl p-6 flex flex-col items-start gap-4 transition-all hover:shadow-cardHover hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-ring",
        className,
      )}
    >
      {/* Icon container con color suave */}
      <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-xl">
        <Icon className="w-6 h-6 text-primary" />
      </div>

      {/* Título y descripción */}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </Link>
  )
}

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground border border-card-border shadow-[0_6px_24px_rgba(159,122,234,0.08)] rounded-[1.25rem] backdrop-blur-sm p-6 transition-all hover:shadow-[0_8px_32px_rgba(159,122,234,0.12)]",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex flex-col gap-4 px-6 pb-2 pt-4 border-b border-border",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="card-title"
      className={cn("text-lg font-semibold leading-tight text-foreground", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 py-4", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center justify-between px-6 pt-4 border-t border-border", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("self-start justify-self-end", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
}