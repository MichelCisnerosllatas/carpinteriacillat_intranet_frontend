'use client'

import { useEffect, useState } from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/shared/ui/sidebar'
import { sidebarData } from '@/shared/config/sidebar-data'
import {
  type SidebarCollapsible,
  type SidebarVariant,
  useLayoutStore,
} from '@/shared/stores/layout-store'
import { NavGroup } from './nav-group'
import { TeamSwitcher } from './team-switcher'
import { NavUser } from './nav-user'

type AppSidebarProps = {
  defaultVariant: SidebarVariant
  defaultCollapsible: SidebarCollapsible
}

export function AppSidebar({ defaultVariant, defaultCollapsible }: AppSidebarProps) {
  const [mounted, setMounted] = useState(false)
  const { collapsible, variant } = useLayoutStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Sidebar
      collapsible={mounted ? collapsible : defaultCollapsible}
      variant={mounted ? variant : defaultVariant}
    >
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((group) => (
          <NavGroup key={group.title} {...group} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
