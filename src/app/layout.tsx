'use client'

import './globals.css'
import { ReactNode, useEffect, useState } from 'react'
import { Poppins } from 'next/font/google'
import { ThemeProvider, useTheme } from 'next-themes'
import { Toaster } from 'sonner'

const poppins = Poppins({
  weight: ['400', '600', '800'],
  subsets: ['latin'],
  display: 'swap',
})

export default function RootLayout({ children }: { children: ReactNode }) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDarkMode = theme === 'dark'

  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`h-full ${mounted && isDarkMode ? 'dark' : ''}`}
    >
      <body
        className={`
          ${poppins.className}
          h-full min-h-screen w-full
          bg-background text-foreground
          antialiased transition-colors duration-300 ease-in-out
        `}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <Toaster position="top-center" theme="light" />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
