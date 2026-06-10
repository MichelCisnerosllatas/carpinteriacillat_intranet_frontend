'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/shared/lib/utils'
import { Separator } from '@/shared/ui/separator'
import { SidebarTrigger } from '@/shared/ui/sidebar'
import { NotificationDropdown } from './notification-dropdown'
import { UserMenuCompact } from './user-menu-compact'
import { sidebarData } from '@/shared/config/sidebar-data'
import { useAuthStore } from '@/features/auth/stores/auth.store'

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean
  title?: string
}

export function Header({ className, fixed = true, title, children, ...props }: HeaderProps) {
  const [offset, setOffset] = useState(0)
  const loginDataDTO = useAuthStore((state) => state.loginDataDTO)

  const currentUser = {
    name: `${loginDataDTO?.person?.person_name ?? 'Usuario'} ${loginDataDTO?.person?.person_lastname ?? ''}`.trim(),
    email: loginDataDTO?.user?.email ?? 'Sin correo',
    avatar: '',
  }

  useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop)
    }
    document.addEventListener('scroll', onScroll, { passive: true })
    return () => document.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'z-50 h-16',
        fixed && 'header-fixed peer/header sticky top-0 w-[inherit]',
        offset > 10 && fixed ? 'shadow' : 'shadow-none',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'relative flex h-full items-center gap-3 px-4',
          offset > 10 &&
            fixed &&
            'after:absolute after:inset-0 after:-z-10 after:bg-background/80 after:backdrop-blur-md'
        )}
      >
        {/* ── Left ───────────────────────────────────── */}
        <SidebarTrigger variant="outline" className="max-md:scale-125" />
        <Separator orientation="vertical" className="h-6" />
        {title && <h1 className="text-base font-semibold">{title}</h1>}
        {children}

        {/* ── Right: only notifications + avatar ─────── */}
        <div className="ms-auto flex items-center gap-1">
          <NotificationDropdown />
          <Separator orientation="vertical" className="mx-1 h-6" />
          {/* Compact: avatar only — same dropdown options as sidebar NavUser */}
          {/*<UserMenuCompact user={sidebarData.user} />*/}
          <UserMenuCompact user={currentUser} />
        </div>
      </div>
    </header>
  )
}
