'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
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
import { getImageUrl } from '@/features/images/lib/image-url'

type AppSidebarProps = {
  defaultVariant: SidebarVariant
  defaultCollapsible: SidebarCollapsible
}

export function AppSidebar({ defaultVariant, defaultCollapsible }: AppSidebarProps) {
  const [mounted, setMounted] = useState(false)
  const { collapsible, variant } = useLayoutStore()
  const {loginDataDTO} = useAuthStore();
  const pathname = usePathname()
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Al cambiar de pantalla, lleva el enlace activo a la vista. Se espera a que termine la
  // animación de apertura del grupo; 'nearest' no mueve nada si el enlace ya está visible.
  useEffect(() => {
    const t = window.setTimeout(() => {
      contentRef.current
        ?.querySelector<HTMLElement>('[data-active="true"]')
        ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }, 250)
    return () => window.clearTimeout(t)
  }, [pathname])

  // const loginDataDTO = useAuthStore((state) => state.loginDataDTO)
  const currentUser = {
    name: `${loginDataDTO?.person?.person_name ?? 'Usuario'} ${loginDataDTO?.person?.person_lastname ?? ''}`.trim(),
    email: loginDataDTO?.user?.email ?? 'Sin correo',
    avatar: loginDataDTO?.person?.photo_url ? getImageUrl(loginDataDTO.person.photo_url) : '',
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
      <SidebarContent ref={contentRef}>
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
