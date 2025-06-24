'use client'

import './globals.css'
import { ReactNode, useEffect, useState } from 'react'
import { Nunito } from 'next/font/google'

import { Toaster } from 'sonner'

const nunito = Nunito({
  weight: ['400', '600', '800'],
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
           ${nunito.className}
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
