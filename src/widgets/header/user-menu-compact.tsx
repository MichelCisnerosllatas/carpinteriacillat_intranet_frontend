'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import type { NavUser } from '@/shared/config/nav-types'
import { AppearanceDrawer } from './appearance-drawer/appearance-drawer'
import { UserMenuContent } from '@/widgets/user-menu/user-menu-content'
import { getInitials } from '@/shared/lib/get-initials'

/**
 * Menú del usuario en el header (arriba a la derecha).
 * Botón: solo la foto redonda. Las opciones están en UserMenuContent (las mismas que en el sidebar).
 */
export function UserMenuCompact({ user }: { user: NavUser }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [appearanceOpen, setAppearanceOpen] = useState(false)

  const initials = getInitials(user.name)

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <DropdownMenuTrigger asChild>
                <button
                  className="rounded-full outline-none ring-offset-2 ring-offset-background transition-shadow hover:ring-2 hover:ring-primary/40 focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:ring-2 data-[state=open]:ring-primary"
                  aria-label="Menú de usuario"
                >
                  <Avatar className="size-8 rounded-full">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-full text-xs">{initials}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
            </span>
          </TooltipTrigger>
          <TooltipContent>Menú de usuario</TooltipContent>
        </Tooltip>

        <DropdownMenuContent align="end" sideOffset={8} className="w-72 rounded-xl p-1.5">
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

      <AppearanceDrawer open={appearanceOpen} onOpenChange={setAppearanceOpen} />
    </>
  )
}
