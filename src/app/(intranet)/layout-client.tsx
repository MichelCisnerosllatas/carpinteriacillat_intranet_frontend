'use client'

import type { SidebarCollapsible, SidebarVariant } from '@/shared/stores/layout-store'
import { cn } from '@/shared/lib/utils'
import { SidebarInset, SidebarProvider } from '@/shared/ui/sidebar'
import { AppSidebar } from '@/widgets/sidebar/app-sidebar'
import { CommandMenu } from '@/widgets/command-menu/command-menu'

type DashboardLayoutClientProps = {
  children: React.ReactNode
  defaultSidebarOpen: boolean
  defaultSidebarVariant: SidebarVariant
  defaultSidebarCollapsible: SidebarCollapsible
}

export function DashboardLayoutClient({
  children,
  defaultSidebarOpen,
  defaultSidebarVariant,
  defaultSidebarCollapsible,
}: DashboardLayoutClientProps) {
  return (
    <SidebarProvider defaultOpen={defaultSidebarOpen}>
      <AppSidebar
        defaultVariant={defaultSidebarVariant}
        defaultCollapsible={defaultSidebarCollapsible}
      />
      <SidebarInset
        className={cn(
          '@container/content',
          'has-data-[layout=fixed]:h-svh',
          'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]'
        )}
      >
        {children}
      </SidebarInset>
      <CommandMenu />
    </SidebarProvider>
  )
}
