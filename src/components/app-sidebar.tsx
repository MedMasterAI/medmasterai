"use client"
import { useTheme } from 'next-themes'
import Image from "next/image"
import { Menu } from "lucide-react"
import {
  BookOpen,
  Bot,
  Video,
  FileTextIcon,
  LayoutDashboard,
  CreditCard,
  LucideIcon,
} from "lucide-react"
import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"

interface AppSidebarProps {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  className?: string
}

interface NavItem {
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
  items?: {
    title: string
    url: string
    icon?: LucideIcon
  }[]
}

export function AppSidebar({ collapsed, setCollapsed, className = "" }: AppSidebarProps) {
  const { theme } = useTheme()

  const navMain: NavItem[] = [
    {
      title: "ApuntyApps",
      url: "#",
      icon: BookOpen,
      isActive: true,
      items: [
        { title: "ApuntyAI", url: "/dashboard/apunty", icon: Bot },
        { title: "VideoAI", url: "/dashboard/videoai", icon: Video },
        { title: "Mis Apuntes", url: "/dashboard/mis-apuntes", icon: FileTextIcon },
      ],
    },
    {
      title: "Panel de Control",
      url: "#",
      icon: LayoutDashboard,
      items: [
        { title: "Pagos", url: "/pagos", icon: CreditCard },
      ],
    },
  ]

  return (
    <aside
      className={`
        min-h-screen flex flex-col justify-between
        bg-[var(--sidebar)] border-r border-[var(--sidebar-border)]
        shadow-xl z-20
        text-sidebar-foreground font-poppins
        transition-all
        duration-300
        ${collapsed ? "w-[4.5rem]" : "w-64"}
        ${className}
        relative
      `}
    >
      {/* Botón trigger colapsar/expandir */}
      <button
        type="button"
        aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        onClick={() => setCollapsed(!collapsed)}
        className={`
          absolute right-[-18px] top-4 z-30
          border border-[var(--sidebar-border)] shadow-lg bg-[var(--sidebar)]
          transition-all duration-300 rounded-full p-1 hover:bg-[var(--sidebar-accent)]
          flex items-center justify-center
        `}
        tabIndex={0}
      >
        <Menu
          className={`
            text-muted-foreground transition-transform duration-200
            ${collapsed ? "rotate-180" : ""}
          `}
          size={22}
        />
      </button>

    {/* Header: Logo */}
<SidebarHeader className={`flex flex-col items-center gap-4 pt-8 pb-4 transition-all duration-300 ${collapsed ? "px-0" : ""}`}>
  <Link href="/dashboard" className="flex flex-col items-center gap-2 group">
    <Image
      src={theme === 'dark' ? "/logo2.PNG" : "/logo1.png"}
      alt="Logo MedMasterAI"
      width={collapsed ? 36 : 66}
      height={collapsed ? 36 : 66}
      className="rounded-2xl shadow-md transition-all duration-300 group-hover:scale-105"
      priority
    />
    {!collapsed && (
      <>
        <span className="text-xl font-extrabold text-[var(--sidebar-foreground)] group-hover:text-[var(--primary)] transition">
          MedMasterAI
        </span>
        <span className="text-xs font-medium text-[var(--sidebar-foreground)]/70">
          Study
        </span>
      </>
    )}
  </Link>
</SidebarHeader>


      {/* Menú principal */}
      <SidebarContent className="flex-1 flex flex-col gap-6 px-2 transition-all duration-300">
        <NavMain items={navMain} collapsed={collapsed} />
      </SidebarContent>

      {/* Footer: usuario */}
      <SidebarFooter className="py-8 flex flex-col items-center gap-2 border-t border-[var(--sidebar-border)]">
        <NavUser />
      </SidebarFooter>
    </aside>
  )
}