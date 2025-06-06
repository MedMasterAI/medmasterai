'use client'

import './globals.css'
import { ReactNode } from 'react'
import { Poppins } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/toaster'

const poppins = Poppins({
  weight: ['400', '600', '800'],
  subsets: ['latin'],
  display: 'swap',
})

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className="h-full">
      <body
        className={`
          ${poppins.className}
          h-full
          min-h-screen
          w-full
          text-text
          bg-transparent
        `}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <Toaster />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
