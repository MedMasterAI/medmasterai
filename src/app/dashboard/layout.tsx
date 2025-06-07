'use client'

import { ReactNode } from 'react'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/toaster'
import { AppSidebar } from '@/components/app-sidebar'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      {/* Fondo principal en gradiente */}
      <div className="fixed inset-0 -z-20 bg-gradient-to-br from-[#1c1c52] to-[#313185]" />

      {/* Contenido con sidebar */}
      <div className="relative flex min-h-screen w-full text-white">
        <AppSidebar />
        <SidebarInset className="z-10 flex-1 min-h-screen">{children}</SidebarInset>
        <Toaster />
      </div>
    </SidebarProvider>
  )
}

