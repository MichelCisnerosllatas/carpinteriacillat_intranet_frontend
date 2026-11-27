'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { SidebarMenuButton, SidebarMenuItem } from '@/shared/ui/sidebar'
import { cn } from '@/shared/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import type { NavCollapsible, NavLink } from '@/shared/config/nav-types'
import { checkIsActive } from './utils'
import { NavBadge } from './nav-badge'

export function SidebarMenuCollapsedDropdown({ item, pathname }: { item: NavCollapsible; pathname: string }) {
  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton tooltip={item.title} isActive={checkIsActive(pathname, item)}>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight className="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" sideOffset={4}>
          <DropdownMenuLabel>{item.title}{item.badge ? ` (${item.badge})` : ''}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {item.items.map((sub) => (
            <DropdownMenuItem key={`${sub.title}-${sub.url}`} asChild>
              <Link
                href={sub.url}
                className={cn(
                  'focus:bg-sidebar-primary/20 focus:text-sidebar-foreground active:bg-sidebar-primary/45',
                  checkIsActive(pathname, sub as NavLink) && 'bg-sidebar-primary/45 font-medium focus:bg-sidebar-primary/55'
                )}
              >
                {sub.icon && <sub.icon />}
                <span className="max-w-52 text-wrap">{sub.title}</span>
                {sub.badge && <span className="ms-auto text-xs">{sub.badge}</span>}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}
