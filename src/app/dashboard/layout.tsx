"use client"

import { ReactNode, useState } from "react"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toaster"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const sidebarWidth = collapsed ? "4.5rem" : "16rem"

  return (
    <SidebarProvider>
      {/* Fondo Aurora Moderno */}
      <div className="fixed inset-0 -z-20 w-full h-full pointer-events-none bg-background">
        {/* Lila suave */}
        <div className="absolute left-[15%] top-[8%] w-[60vw] h-[60vw] bg-[radial-gradient(circle,rgba(123,97,255,0.22)_0%,transparent_70%)] rounded-full blur-[140px]" />
        {/* Azul digital */}
        <div className="absolute right-[10%] bottom-[20%] w-[50vw] h-[50vw] bg-[radial-gradient(circle,rgba(50,82,255,0.18)_0%,transparent_70%)] rounded-full blur-[120px]" />
        {/* Glow blanco */}
        <div className="absolute left-1/2 top-[60%] w-[40vw] h-[40vw] bg-[radial-gradient(circle,rgba(255,255,255,0.05)_0%,transparent_80%)] rounded-full blur-[100px]" />
      </div>

      {/* Estructura principal */}
      <div className="relative flex min-h-screen w-full text-foreground bg-background transition-colors">

        {/* Sidebar móvil */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden absolute top-4 left-4 z-50">
            <Button variant="ghost" size="icon">
              <Menu />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SheetHeader className="sr-only">
              <SheetTitle>Menú de navegación</SheetTitle>
              <SheetDescription>Muestra la barra lateral móvil.</SheetDescription>
            </SheetHeader>
            <AppSidebar collapsed={false} setCollapsed={() => {}} />
          </SheetContent>
        </Sheet>

        {/* Sidebar desktop */}
        <div
          className="hidden md:flex fixed top-0 left-0 bottom-0 z-30 transition-all duration-300"
          style={{ width: sidebarWidth }}
        >
          <AppSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        </div>

        {/* Contenido desplazado */}
        <SidebarInset
          className="z-10 flex-1 min-h-screen transition-all duration-300"
          style={{ marginLeft: sidebarWidth }}
        >
          {children}
        </SidebarInset>

        <Toaster />
      </div>
    </SidebarProvider>
  )
}