'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/ui/collapsible'
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/shared/ui/sidebar'
import type { NavCollapsible, NavLink } from '@/shared/config/nav-types'
import { checkIsActive } from './utils'
import { NavBadge } from './nav-badge'

export function SidebarMenuCollapsible({ item, pathname }: { item: NavCollapsible; pathname: string }) {
  const { setOpenMobile } = useSidebar()
  const isActive = checkIsActive(pathname, item)
  const [open, setOpen] = useState(isActive)

  // El sidebar vive en el layout y no se vuelve a montar al navegar: si se llega a un
  // submódulo desde otra pantalla (no desde el sidebar), se abre su grupo. Nunca se
  // cierra solo, así se respetan los grupos que el usuario abrió a mano.
  useEffect(() => {
    if (isActive) setOpen(true)
  }, [isActive, pathname])

  return (
    <Collapsible asChild open={open} onOpenChange={setOpen} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title}>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight className="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 rtl:rotate-180" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className="CollapsibleContent">
          <SidebarMenuSub>
            {item.items.map((sub) => (
              <SidebarMenuSubItem key={sub.title}>
                <SidebarMenuSubButton asChild isActive={checkIsActive(pathname, sub as NavLink)}>
                  <Link href={sub.url} onClick={() => setOpenMobile(false)}>
                    {sub.icon && <sub.icon />}
                    <span>{sub.title}</span>
                    {sub.badge && <NavBadge>{sub.badge}</NavBadge>}
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}
