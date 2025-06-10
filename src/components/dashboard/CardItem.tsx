"use client"

import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

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
      <Card
        className={cn(
          "bg-[var(--card-feature)] border border-[var(--card-feature-border)] rounded-card shadow-card hover:shadow-cardHover transition-all",
          className
        )}
      >
        <Link href={href} className="block">
          <CardContent className="p-6 flex flex-col items-center gap-2 text-center">
            <Icon className="w-10 h-10 mb-1 text-[var(--card-feature-title)]" />
            <span className="text-base font-semibold text-[var(--card-feature-title)]">
              {title}
            </span>
            <span className="text-sm opacity-80 text-[var(--card-feature-desc)] leading-tight">
              {description}
            </span>
          </CardContent>
        </Link>
      </Card>
    </motion.div>
  )
}
