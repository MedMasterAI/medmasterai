'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { motion } from 'framer-motion'

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative w-16 h-8 rounded-full bg-muted transition-colors flex items-center px-1"
    >
      <motion.div
        className="absolute left-1 top-1 w-6 h-6 bg-background rounded-full shadow-md z-10"
        animate={{ x: isDark ? 32 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      />
      <div className="flex justify-between w-full z-0 px-2 text-xs">
        <Moon className="w-4 h-4" />
        <Sun className="w-4 h-4" />
      </div>
    </button>
  )
}
