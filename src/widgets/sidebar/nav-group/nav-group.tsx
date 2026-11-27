'use client'

import { usePathname } from 'next/navigation'
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, useSidebar } from '@/shared/ui/sidebar'
import type { NavCollapsible, NavGroup as NavGroupType, NavLink } from '@/shared/config/nav-types'
import { SidebarMenuLink } from './sidebar-menu-link'
import { SidebarMenuCollapsedDropdown } from './sidebar-menu-collapsed-dropdown'
import { SidebarMenuCollapsible } from './sidebar-menu-collapsible'

export function NavGroup({ title, items }: NavGroupType) {
  const { state, isMobile } = useSidebar()
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const key = `${item.title}-${(item as NavLink).url ?? ''}`
          if (!item.items)
            return <SidebarMenuLink key={key} item={item as NavLink} pathname={pathname} />
          if (state === 'collapsed' && !isMobile)
            return <SidebarMenuCollapsedDropdown key={key} item={item as NavCollapsible} pathname={pathname} />
          return <SidebarMenuCollapsible key={key} item={item as NavCollapsible} pathname={pathname} />
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
