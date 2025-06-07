"use client"

import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface CardItemProps {
  href: string
  title: string
  description: string
  icon: LucideIcon
  className?: string
}

export default function CardItem({
  href,
  title,
  description,
  icon: Icon,
  className,
}: CardItemProps) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
      <Link
        href={href}
        className={cn(
          "rounded-2xl bg-primary text-primary-foreground p-6 flex flex-col items-center gap-2 shadow-md",
          "transition-transform",
          className
        )}
      >
        <Icon className="w-10 h-10 mb-1" />
        <span className="text-base font-semibold">{title}</span>
        <span className="text-sm opacity-80 text-center leading-tight">
          {description}
        </span>
      </Link>
    </motion.div>
  )
}
