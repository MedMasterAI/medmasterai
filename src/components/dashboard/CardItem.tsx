"use client"

import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

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
          "group relative rounded-xl border border-border bg-card/80 backdrop-blur-sm transition-shadow hover:shadow-md",
          className
        )}
      >
        <Link href={href} className="flex flex-col items-center gap-3 py-6">
          <span className="bg-primary/10 text-primary rounded-full p-3 mb-1">
            <Icon className="w-6 h-6" />
          </span>
          <span className="text-sm font-semibold">{title}</span>
          <span className="text-xs text-muted-foreground text-center">
            {description}
          </span>
        </Link>
      </Card>
    </motion.div>
  )
}
