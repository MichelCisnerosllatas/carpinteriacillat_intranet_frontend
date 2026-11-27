'use client'

import Link from 'next/link'
import { LogOut, MonitorSmartphone, Paintbrush, ShieldCheck, UserRound } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/shared/ui/dropdown-menu'
import { getInitials } from '@/shared/lib/get-initials'
import type { NavUser } from '@/shared/config/nav-types'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { useLogoutHandler } from '@/features/auth/hooks/useLogoutHandler'
import { MenuOption } from './menu-option'

type UserMenuContentProps = {
  user: NavUser
  /** Se llama al elegir "Apariencia y diseño" (cada menú abre su propio panel). */
  onOpenAppearance: () => void
}

/**
 * Contenido del menú del usuario. Es el MISMO para:
 *   - el sidebar (widgets/sidebar/nav-user.tsx)
 *   - el header  (widgets/header/user-menu-compact.tsx)
 * Solo cambia el botón que lo abre. Si agregas una opción, agrégala aquí y aparece en los dos.
 */
export function UserMenuContent({ user, onOpenAppearance }: UserMenuContentProps) {
  const { handleLogout } = useLogoutHandler()
  const role = useAuthStore((state) => state.session?.user.role)
  const initials = getInitials(user.name)

  return (
    <>
      {/* Cabecera: foto, nombre, correo y rol */}
      <DropdownMenuLabel className="p-0 font-normal">
        <div className="flex items-center gap-3 rounded-md bg-muted/50 p-3">
          <Avatar className="size-11 rounded-full ring-2 ring-background">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="rounded-full text-sm font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="grid min-w-0 flex-1 gap-0.5 text-start leading-tight">
            <span className="truncate text-sm font-semibold">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
            {role?.role_name && (
              <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary capitalize">
                <ShieldCheck className="size-3" />
                {role.role_name}
              </span>
            )}
          </div>
        </div>
      </DropdownMenuLabel>

      <DropdownMenuSeparator />

      <DropdownMenuGroup>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/profile">
            <MenuOption icon={<UserRound />} title="Mi perfil" hint="Tus datos y contraseña" />
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/profile/devices">
            <MenuOption icon={<MonitorSmartphone />} title="Mis dispositivos" hint="Sesiones abiertas" />
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={(e) => {
            // Se evita que el menú se cierre solo: lo cierra quien abre el panel de apariencia.
            e.preventDefault()
            onOpenAppearance()
          }}
        >
          <MenuOption icon={<Paintbrush />} title="Apariencia y diseño" hint="Tema, colores y menú" />
        </DropdownMenuItem>
      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      <DropdownMenuItem
        className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
        onSelect={() => void handleLogout()}
      >
        <MenuOption icon={<LogOut />} title="Cerrar sesión" danger />
      </DropdownMenuItem>
    </>
  )
}
