'use client'

import type { SidebarCollapsible, SidebarVariant } from '@/shared/stores/layout-store'
import { cn } from '@/shared/lib/utils'
import { SidebarInset, SidebarProvider } from '@/shared/ui/sidebar'
import { AppSidebar } from '@/widgets/sidebar/app-sidebar'
import { CommandMenu } from '@/widgets/command-menu/command-menu'
import { LandingPreview } from '@/widgets/landing-preview'
import { LandingPreviewSpacer } from '@/widgets/landing-preview/landing-preview-spacer'
import { AuthSessionProvider } from '@/features/auth/ui/auth-session-provider'

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
    <AuthSessionProvider>
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
        
        {/* Hermano real en el flex-row (no padding) — ver landing-preview-spacer.tsx para el
            porqué: así SidebarInset (header de cada página + contenido, como una sola caja
            con sus propias esquinas redondeadas) se achica de verdad cuando el panel está
            abierto, sin dejar un hueco vacío entre el header y el panel. */}
        <LandingPreviewSpacer />
        <CommandMenu />
        <LandingPreview />
      </SidebarProvider>
    </AuthSessionProvider>
  )
  // return (
  //   <SidebarProvider defaultOpen={defaultSidebarOpen}>
  //     <AppSidebar
  //       defaultVariant={defaultSidebarVariant}
  //       defaultCollapsible={defaultSidebarCollapsible}
  //     />
  //     <SidebarInset
  //       className={cn(
  //         '@container/content',
  //         'has-data-[layout=fixed]:h-svh',
  //         'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]'
  //       )}
  //     >
  //       {children}
  //     </SidebarInset>
  //     <CommandMenu />
  //   </SidebarProvider>
  // )
}
