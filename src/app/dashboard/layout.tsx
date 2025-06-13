'use client'

import { ReactNode } from 'react'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/toaster'
import { AppSidebar } from '@/components/app-sidebar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      {/* Fondo principal en gradiente */}
      <div className="fixed inset-0 -z-20 bg-gradient-to-br from-[#1c1c52] to-[#313185]" />

      <div className="relative flex min-h-screen w-full text-white">
        {/* Sidebar mobile */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden absolute top-4 left-4 z-50">
            <Button variant="ghost" size="icon">
              <Menu />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <AppSidebar />
          </SheetContent>
        </Sheet>

        <AppSidebar className="hidden md:flex" />
        <SidebarInset className="z-10 flex-1 min-h-screen">{children}</SidebarInset>
        <Toaster />
      </div>
    </SidebarProvider>
  )
}