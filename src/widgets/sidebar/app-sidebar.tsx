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
import { useSearchStore } from '@/shared/stores/search-store'
import { NavGroup } from './nav-group'
import { TeamSwitcher } from './team-switcher'
import { NavUser } from './nav-user'
import { SidebarSearch } from './sidebar-search'
import { SidebarToggle } from './sidebar-toggle'

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
  // animación de apertura del grupo.
  // - Navegación normal: 'nearest' no mueve nada si el enlace ya está visible.
  // - Desde el buscador (revealActive): el módulo queda arriba de todo; si es un submódulo,
  //   arriba queda su padre (el collapsible) y el hijo resaltado se ve debajo.
  useEffect(() => {
    const t = window.setTimeout(() => {
      const content = contentRef.current
      const active = content?.querySelector<HTMLElement>('[data-active="true"]')
      const { revealActive, setRevealActive } = useSearchStore.getState()

      if (content && active && revealActive) {
        const target = active.closest<HTMLElement>('[data-sidebar="menu-item"]') ?? active
        const top =
          content.scrollTop +
          target.getBoundingClientRect().top -
          content.getBoundingClientRect().top -
          8
        content.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
      } else {
        active?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
      if (revealActive) setRevealActive(false)
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
        {/* Una fila: empresa · buscar · contraer. Contraído (icon): columna logo → buscar. */}
        <div className="flex items-center gap-0.5 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-2">
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:flex-none">
            <TeamSwitcher teams={sidebarData.teams} />
          </div>
          <SidebarSearch />
          {(mounted ? collapsible : defaultCollapsible) !== 'none' && <SidebarToggle />}
        </div>
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
