'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { motion } from 'framer-motion'

export const ThemeToggle = ({ className = "" }: { className?: string }) => {
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const dark = stored === 'dark'
    document.documentElement.classList.toggle('dark', dark)
    setIsDark(dark)
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <button
      onClick={() => {
        const newDark = !isDark
        document.documentElement.classList.toggle('dark', newDark)
        localStorage.setItem('theme', newDark ? 'dark' : 'light')
        document.dispatchEvent(new CustomEvent('theme-change', { detail: newDark }))
        setIsDark(newDark)
      }}
      className={`relative w-16 h-8 rounded-full bg-muted transition-colors flex items-center px-1 ${className}`}
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
