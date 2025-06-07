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
      <Card className={cn("bg-primary text-primary-foreground shadow-md", className)}>
        <Link href={href} className="block">
          <CardContent className="p-6 flex flex-col items-center gap-2">
            <Icon className="w-10 h-10 mb-1" />
            <span className="text-base font-semibold">{title}</span>
            <span className="text-sm opacity-80 text-center leading-tight">
              {description}
            </span>
          </CardContent>
        </Link>
      </Card>
    </motion.div>
  )
}
