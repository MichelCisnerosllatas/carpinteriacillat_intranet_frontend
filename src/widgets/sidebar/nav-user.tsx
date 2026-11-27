'use client'

import { useState } from 'react'
import { ChevronsUpDown } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/shared/ui/sidebar'
import type { NavUser as NavUserType } from '@/shared/config/nav-types'
import { AppearanceDrawer } from '@/widgets/header/appearance-drawer/appearance-drawer'
import { UserMenuContent } from '@/widgets/user-menu/user-menu-content'
import { getInitials } from '@/shared/lib/get-initials'

/**
 * Menú del usuario en la parte de abajo del sidebar.
 * Botón: foto + nombre + correo. Las opciones están en UserMenuContent (las mismas que en el header).
 */
export function NavUser({ user }: { user: NavUserType }) {
  const { isMobile } = useSidebar()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [appearanceOpen, setAppearanceOpen] = useState(false)

  const initials = getInitials(user.name)

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-start text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
                <ChevronsUpDown className="ms-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-xl p-1.5"
              side={isMobile ? 'bottom' : 'right'}
              align="end"
              sideOffset={6}
            >
              <UserMenuContent
                user={user}
                onOpenAppearance={() => {
                  // Primero se cierra el menú y luego se abre el panel (si no, el menú queda abierto encima).
                  setDropdownOpen(false)
                  setTimeout(() => setAppearanceOpen(true), 150)
                }}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <AppearanceDrawer open={appearanceOpen} onOpenChange={setAppearanceOpen} />
    </>
  )
}
