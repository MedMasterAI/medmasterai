'use client'

import { ReactNode } from 'react'
import { Sidebar, SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/toaster'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      {/* Fondo Aurora global, SIEMPRE con fixed e inset-0 */}
      <div className="fixed inset-0 -z-20 w-full h-full pointer-events-none">
        <div className="w-full h-full bg-[#191936] absolute" />
        {/* Aurora violeta */}
        <div className="absolute left-1/4 top-1/4 w-[50vw] h-[40vw] bg-purple-700 opacity-30 rounded-full blur-3xl" />
        {/* Aurora azul */}
        <div className="absolute left-2/3 top-1/2 w-[40vw] h-[30vw] bg-blue-500 opacity-30 rounded-full blur-2xl" />
        {/* Aurora rosada */}
        <div className="absolute right-1/4 top-2/3 w-[30vw] h-[25vw] bg-pink-500 opacity-20 rounded-full blur-3xl" />
        {/* Extra: radial white glow */}
        <div className="absolute left-1/2 top-1/3 w-[20vw] h-[10vw] bg-white opacity-10 rounded-full blur-2xl" />
      </div>

      {/* Wrapper del layout (NO uses h-screen, solo min-h-screen y w-full) */}
      <div className="relative flex min-h-screen w-full text-white">
        <Sidebar />
        <SidebarInset className="z-10 flex-1 min-h-screen">{children}</SidebarInset>
        <Toaster />
      </div>
    </SidebarProvider>
  )
}

