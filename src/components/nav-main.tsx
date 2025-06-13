"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
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
    icon: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
      icon?: LucideIcon
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
                      className={`flex items-center rounded-lg transition-all duration-200 ${
                        isCollapsed
                          ? "justify-center w-11 h-11 p-0 mx-auto"
                          : "gap-2 px-2 py-2"
                      }`}
                    >
                      <item.icon
                        className="text-[#a990ff] transition-all duration-200"
                        size={isCollapsed ? 24 : 20}
                      />
                      {!isCollapsed && (
                        <span className="text-base font-medium">{item.title}</span>
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
                                  className={`flex items-center transition-all duration-200 ${
                                    isCollapsed
                                      ? "justify-center w-10 h-10 p-0 mx-auto"
                                      : "gap-2 px-2 py-2"
                                  }`}
                                >
                                  {subItem.icon && (
                                    <subItem.icon
                                      className="text-muted-foreground transition group-hover:text-primary"
                                      size={isCollapsed ? 22 : 18}
                                    />
                                  )}
                                  {!isCollapsed && (
                                    <span className="text-sm font-normal">
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