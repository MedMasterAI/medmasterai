'use client'

import './globals.css'
import { ReactNode, useEffect, useState } from 'react'
import { Inter } from 'next/font/google'

import { Toaster } from 'sonner'

const inter = Inter({
  weight: ['400', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
})

export default function RootLayout({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const isDark = stored === 'dark'
    document.documentElement.classList.toggle('dark', isDark)
    setMounted(true)
  }, [])

  return (
    <html lang="es" suppressHydrationWarning className="h-full">
      <body
        className={`
           ${inter.className}
          h-full min-h-screen w-full
          bg-background text-foreground
          antialiased transition-colors duration-300 ease-in-out
        `}
      >
        <Toaster position="top-center" theme="light" />
        {mounted && children}
      </body>
    </html>
  )
}
