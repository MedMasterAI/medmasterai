"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bot, Video, BookOpen, User, Mic } from "lucide-react"

const items = [
  { href: "/dashboard/apunty", label: "Apunty", icon: Bot },
  { href: "/dashboard/videoai", label: "VideoAI", icon: Video },
  { href: "/dashboard/audioai", label: "AudioAI", icon: Mic },
  { href: "/dashboard/mis-apuntes", label: "Apuntes", icon: BookOpen },
  { href: "/dashboard", label: "Perfil", icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[var(--sidebar)] border-t border-[var(--sidebar-border)] shadow-xl">
      <ul className="flex justify-around items-center py-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <li key={href}>
              <Link
                href={href}
                aria-label={label}
                className={`flex flex-col items-center gap-1 px-3 py-1 text-sm ${active ? "text-[var(--primary)]" : "text-[var(--sidebar-foreground)]"}`}
              >
                <Icon className="size-6" />
                <span className="text-xs font-medium tracking-wide">{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}