'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  BadgeCheck,
  Bell,
  CreditCard,
  LogOut,
  Paintbrush,
  Sparkles,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import type { NavUser } from '@/shared/config/nav-types'
import { AppearanceDrawer } from './appearance-drawer'
import { useLogoutHandler } from '@/features/auth/hooks/useLogoutHandler'

/**
 * Compact version of the user menu for the Header.
 * Shows only the avatar. Clicking opens the same dropdown as NavUser in the sidebar.
 * "Appearance & Layout" closes the dropdown first, then opens the drawer.
 */
export function UserMenuCompact({ user }: { user: NavUser }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [appearanceOpen, setAppearanceOpen] = useState(false)
  const { handleLogout } = useLogoutHandler()

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="User menu"
          >
            <Avatar className="size-8 rounded-full">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="rounded-full text-xs">{initials}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5">
              <Avatar className="size-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-start text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Sparkles className="mr-2 size-4" />
              Upgrade to Pro
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <BadgeCheck className="mr-2 size-4" />
                Account
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <CreditCard className="mr-2 size-4" />
                Billing
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings/notifications">
                <Bell className="mr-2 size-4" />
                Notifications
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/*
            Fix: close the dropdown first, then open the drawer.
            Using onSelect with e.preventDefault() alone keeps the dropdown open.
            The correct pattern is to close it explicitly before opening the Sheet.
          */}
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault()
              // Close dropdown synchronously, then open drawer after the
              // dropdown close animation completes (one frame is enough).
              setDropdownOpen(false)
              setTimeout(() => setAppearanceOpen(true), 150)
            }}
          >
            <Paintbrush className="mr-2 size-4" />
            Appearance & Layout
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={async (e) => handleLogout()}
          >
            <LogOut className="mr-2 size-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AppearanceDrawer open={appearanceOpen} onOpenChange={setAppearanceOpen} />
    </>
  )
}
