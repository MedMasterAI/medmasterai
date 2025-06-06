"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"

import {
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut as LogOutIcon,
  Sparkles,
} from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavUser() {
  const { isMobile } = useSidebar()
  const router = useRouter()

  // Estado local para usuario autenticado
  const [user, setUser] = useState<{ name: string; email: string; avatar: string } | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser({
          name:   u.displayName ?? "Sin nombre",
          email:  u.email ?? "",
          avatar: u.photoURL ?? "",
        })
      } else {
        setUser(null)
      }
    })
    return () => unsubscribe()
  }, [])

  const handleLogout = useCallback(async () => {
    await auth.signOut()
    router.push("/login")
  }, [router])

  const goToPayments = useCallback(() => {
    router.push("/pagos")
  }, [router])

  // Si no hay usuario logueado, no renderiza nada
  if (!user) return null

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              aria-label="Abrir menú de usuario"
            >
              <Avatar className="h-8 w-8 rounded-lg border-2 border-[#7b61ff] shadow-md">
                {user.avatar
                  ? (
                    <AvatarImage
                      src={user.avatar}
                      alt={user.name}
                      onError={e => e.currentTarget.style.display = 'none'}
                    />
                  )
                  : (
                    <AvatarFallback>
                      {user.name?.[0]?.toUpperCase() || "?"}
                    </AvatarFallback>
                  )
                }
              </Avatar>
              <div className="ml-2 flex-1 text-left text-sm leading-tight">
                <div className="truncate font-medium">{user.name}</div>
                <div className="truncate text-xs text-muted-foreground">{user.email}</div>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
            className="min-w-[14rem] rounded-lg"
          >
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={goToPayments}>
                <Sparkles className="mr-2" />
                Upgrade / Pagos
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={goToPayments}>
                <CreditCard className="mr-2" />
                Facturación
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2" />
                Notificaciones
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem onSelect={handleLogout}>
              <LogOutIcon className="mr-2" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
