'use client'

import Link from 'next/link'
import { SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/shared/ui/sidebar'
import type { NavLink } from '@/shared/config/nav-types'
import { checkIsActive } from './utils'
import { NavBadge } from './nav-badge'

export function SidebarMenuLink({ item, pathname }: { item: NavLink; pathname: string }) {
  const { setOpenMobile } = useSidebar()
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={checkIsActive(pathname, item)} tooltip={item.title}>
        <Link href={item.url} onClick={() => setOpenMobile(false)}>
          {item.icon && <item.icon />}
          <span>{item.title}</span>
          {item.badge && <NavBadge>{item.badge}</NavBadge>}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
