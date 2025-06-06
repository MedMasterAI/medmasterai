"use client"

import Image from "next/image"
import { FileText, Clapperboard, Files, LayoutDashboard, DollarSign, Gauge } from "lucide-react"
import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const navMain = [
    {
      title: "ApuntyApps",
      url: "#",
      icon: FileText,
      isActive: true,
      items: [
        { title: "ApuntyAI", url: "/dashboard/apunty", icon: FileText },
        { title: "VideoAI", url: "/dashboard/videoai", icon: Clapperboard },
        { title: "Mis Apuntes", url: "/dashboard/mis-apuntes", icon: Files },
      ],
    },
    {
      title: "Panel de Control",
      url: "#",
      icon: LayoutDashboard,
      items: [
        
        { title: "Pagos", url: "/pagos", icon: DollarSign },
       
      ],
    },
  ];

  return (
    <Sidebar
    className="
    w-64 min-h-screen flex flex-col justify-between
    bg-[#21194D] border-r border-[#2D2D53]
    shadow-xl z-20
    text-white font-poppins
    transition-colors
  "
      {...props}
    >
      {/* Header: Logo */}
      <SidebarHeader className="flex flex-col items-center gap-4 pt-8 pb-4">
        <Link href="/dashboard" className="flex flex-col items-center gap-2 group">
          <Image
            src="/logo2.PNG"
            alt="Logo MedMasterAI"
            width={66}
            height={66}
            className="rounded-2xl shadow-md transition group-hover:scale-105"
            priority
          />
          <span className="text-xl font-extrabold text-[#a990ff] group-hover:text-[#7b61ff] transition">
            MedMasterAI
          </span>
          <span className="text-xs text-[#bcb9ec] font-medium">Study</span>
        </Link>
      </SidebarHeader>

      {/* Menú principal */}
      <SidebarContent className="flex-1 flex flex-col gap-6 px-4">
        <NavMain items={navMain} />
      </SidebarContent>

      {/* Footer PRO: NavUser con menú */}
      <SidebarFooter className="py-8 flex flex-col items-center gap-2 border-t border-[#23243A]">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
