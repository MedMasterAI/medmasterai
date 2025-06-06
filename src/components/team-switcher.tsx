"use client"

import * as React from "react"
import { ChevronsUpDown, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
}) {
  const [activeTeam, setActiveTeam] = React.useState(teams[0])

  if (!activeTeam) return null

  return (
    <div className="w-full">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex w-full items-center gap-4 rounded-lg border bg-muted px-4 py-2 text-left text-sm hover:bg-muted/80"
          >
            <div className="flex size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
              <activeTeam.logo className="size-4" />
            </div>
            <div className="flex-1 text-sm leading-tight">
              <div className="truncate font-semibold">{activeTeam.name}</div>
              <div className="truncate text-xs text-muted-foreground">{activeTeam.plan}</div>
            </div>
            <ChevronsUpDown className="ml-auto size-4 opacity-50" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          align="start"
          side="right"
          sideOffset={4}
        >
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Teams
          </DropdownMenuLabel>
          {teams.map((team, index) => (
            <DropdownMenuItem
              key={team.name}
              onClick={() => setActiveTeam(team)}
              className="gap-2 p-2"
            >
              <div className="flex size-6 items-center justify-center rounded-sm border">
                <team.logo className="size-4 shrink-0" />
              </div>
              {team.name}
              <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2 p-2">
            <div className="flex size-6 items-center justify-center rounded-md border bg-background">
              <Plus className="size-4" />
            </div>
            <div className="font-medium text-muted-foreground">Add team</div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
