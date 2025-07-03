"use client"

import { ChevronRight } from "lucide-react"
import { IconType } from "react-icons"
import { useState, useEffect } from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"

export function NavMain({
  items,
  collapsed = false,
}: {
  items: {
    title: string
    url: string
    icon: IconType
    isActive?: boolean
    items?: {
      title: string
      url: string
      icon?: IconType
    }[]
  }[]
  collapsed?: boolean
}) {
  const { state } = useSidebar()
  const isCollapsed = collapsed || state === "collapsed"
  const [openStates, setOpenStates] = useState(
    items.map((item) => item.isActive ?? false)
  )

  useEffect(() => {
    if (isCollapsed) {
      setOpenStates(items.map(() => false))
    }
  }, [isCollapsed, items])

  return (
    <SidebarGroup>
      <SidebarGroupLabel className={isCollapsed ? "justify-center px-0 text-xs" : ""}>
        {!isCollapsed && "Página Principal"}
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item, index) => (
          <Collapsible
            key={item.title}
            asChild
            open={openStates[index]}
            onOpenChange={(open) =>
              setOpenStates((prev) =>
                prev.map((o, i) => (i === index ? open : o))
              )
            }
          >
            <SidebarMenuItem>
              {/* === ITEM PRINCIPAL CON TOOLTIP === */}
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <SidebarMenuButton asChild>
                    <a
                      href={item.url}
                      className={`flex items-center font-medium rounded-lg hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)] transition-all duration-200 ${
                        isCollapsed
                          ? "justify-center w-full p-3"
                          : "gap-2 px-3 py-2"
                      }`}
                    >
                      <item.icon
                        className="text-sidebar-primary drop-shadow-sm group-hover:scale-110 transition-transform"
                        size={isCollapsed ? 26 : 22}
                        strokeWidth={2}
                      />
                      {!isCollapsed && (
                        <span className="text-sm tracking-wide">{item.title}</span>
                      )}
                    </a>
                  </SidebarMenuButton>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right" className="capitalize">
                    {item.title}
                  </TooltipContent>
                )}
              </Tooltip>

              {/* === ACCIONES DE SUBMENÚ === */}
              {item.items?.length ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction
                      className={`data-[state=open]:rotate-90 ${
                        isCollapsed ? "hidden" : ""
                      }`}
                    >
                      <ChevronRight />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                              <SidebarMenuSubButton asChild>
                                <a
                                  href={subItem.url}
                                  className={`flex items-center rounded-md hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)] transition-all duration-200 ${
                                    isCollapsed
                                      ? "justify-center w-full p-2.5"
                                      : "gap-2 px-3 py-2"
                                  }`}
                                >
                                  {subItem.icon && (
                                    <subItem.icon
                                      className="text-muted-foreground group-hover:text-primary transition-transform group-hover:scale-110"
                                      size={isCollapsed ? 22 : 18}
                                      strokeWidth={2}
                                    />
                                  )}
                                  {!isCollapsed && (
                                    <span className="text-sm tracking-wide">
                                      {subItem.title}
                                    </span>
                                  )}
                                </a>
                              </SidebarMenuSubButton>
                            </TooltipTrigger>
                            {isCollapsed && (
                              <TooltipContent side="right">{subItem.title}</TooltipContent>
                            )}
                          </Tooltip>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}