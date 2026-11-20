import { cookies } from 'next/headers'
import type { SidebarCollapsible, SidebarVariant } from '@/shared/stores/layout-store'
import { DashboardLayoutClient } from './layout-client'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const sidebarOpen = cookieStore.get('sidebar_state')?.value !== 'false'
  // Ancho ajustable del sidebar (px); el SidebarProvider lo limita a 256–384.
  const sidebarWidth = Number(cookieStore.get('sidebar_width')?.value) || undefined
  const sidebarVariant =(cookieStore.get('layout_variant')?.value || 'inset') as SidebarVariant
  const sidebarCollapsible = (cookieStore.get('layout_collapsible')?.value || 'icon') as SidebarCollapsible

  return (
    <DashboardLayoutClient
      defaultSidebarOpen={sidebarOpen}
      defaultSidebarWidth={sidebarWidth}
      defaultSidebarVariant={sidebarVariant}
      defaultSidebarCollapsible={sidebarCollapsible}
    >
      {children}
    </DashboardLayoutClient>
  )
}
