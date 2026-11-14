'use client'

import * as React from 'react'
import { ChevronDown, PanelLeft, Plus } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/shared/ui/sidebar'
import type { NavTeam } from '@/shared/config/nav-types'

// Selector de empresa compacto (una línea: logo + nombre + ⌄), pensado para compartir fila
// con los botones de buscar y contraer. Con el sidebar contraído (desktop) solo muestra el
// logo, que al pasar el mouse se convierte en el botón de expandir (estilo ChatGPT).
export function TeamSwitcher({ teams }: { teams: NavTeam[] }) {
  const { isMobile, state, toggleSidebar } = useSidebar()
  const [activeTeam, setActiveTeam] = React.useState(teams[0])
  const isCollapsed = state === 'collapsed' && !isMobile

  if (isCollapsed) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={toggleSidebar}
            tooltip="Expandir menú (Ctrl B)"
            aria-label="Expandir menú"
            className="group/logo justify-center group-data-[collapsible=icon]:p-1!"
          >
            <span className="flex size-6 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground group-hover/logo:hidden group-focus-visible/logo:hidden">
              <activeTeam.logo className="size-3.5" />
            </span>
            <PanelLeft className="hidden group-hover/logo:block group-focus-visible/logo:block" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="w-fit max-w-full gap-2 p-1 pe-2 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <activeTeam.logo className="size-3.5" />
              </span>
              <span className="truncate font-semibold">{activeTeam.name}</span>
              <ChevronDown className="size-3.5! text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-56 rounded-lg" align="start" side="bottom" sideOffset={4}>
            <DropdownMenuLabel className="text-xs text-muted-foreground">Teams</DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem key={team.name} onClick={() => setActiveTeam(team)} className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <team.logo className="size-4 shrink-0" />
                </div>
                <div className="grid leading-tight">
                  <span>{team.name}</span>
                  <span className="text-xs text-muted-foreground">{team.plan}</span>
                </div>
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
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
