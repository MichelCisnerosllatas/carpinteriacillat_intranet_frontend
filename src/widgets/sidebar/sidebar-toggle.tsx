'use client'

import { PanelLeft, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { useSidebar } from '@/shared/ui/sidebar'

// Botón para contraer el sidebar desde su propio header. Contraído (modo icon) se oculta:
// ahí expande el logo del TeamSwitcher. En mobile se muestra como ✕ y cierra el panel.
export function SidebarToggle() {
  const { isMobile, toggleSidebar } = useSidebar()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label={isMobile ? 'Cerrar menú' : 'Contraer menú'}
          className="size-8 shrink-0 text-sidebar-foreground/70 hover:bg-sidebar-primary/20 hover:text-sidebar-foreground group-data-[collapsible=icon]:hidden"
        >
          {isMobile ? <X className="size-4" /> : <PanelLeft className="size-4" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{isMobile ? 'Cerrar menú' : 'Contraer menú (Ctrl B)'}</TooltipContent>
    </Tooltip>
  )
}
