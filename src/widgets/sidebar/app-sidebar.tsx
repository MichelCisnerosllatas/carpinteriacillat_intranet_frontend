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

import { filterNavByRole } from '@/shared/config/nav-types'
import { useAuthStore } from '@/features/auth/stores/auth.store'

type AppSidebarProps = {
  defaultVariant: SidebarVariant
  defaultCollapsible: SidebarCollapsible
}

export function AppSidebar({ defaultVariant, defaultCollapsible }: AppSidebarProps) {
  const [mounted, setMounted] = useState(false)
  const { collapsible, variant } = useLayoutStore()
  const {loginDataDTO} = useAuthStore();

  useEffect(() => {
    setMounted(true)
  }, [])

  // const loginDataDTO = useAuthStore((state) => state.loginDataDTO)
  const currentUser = {
    name: `${loginDataDTO?.person?.person_name ?? 'Usuario'} ${loginDataDTO?.person?.person_lastname ?? ''}`.trim(),
    email: loginDataDTO?.user?.email ?? 'Sin correo',
    avatar: '',
  }

  const currentRole = loginDataDTO?.user?.id_rol ? String(loginDataDTO.user.id_rol) : undefined;
  const filteredGroups = filterNavByRole(sidebarData.navGroups, currentRole)

  return (
    <Sidebar
      collapsible={mounted ? collapsible : defaultCollapsible}
      variant={mounted ? variant : defaultVariant}
    >
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        {filteredGroups.map((group) => (
          <NavGroup key={group.title} {...group} />
        ))}
        {/*{sidebarData.navGroups.map((group) => (*/}
        {/*  <NavGroup key={group.title} {...group} />*/}
        {/*))}*/}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={currentUser} />
        {/*<NavUser user={sidebarData.user} />*/}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
