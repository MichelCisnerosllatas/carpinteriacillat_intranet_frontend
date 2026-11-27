'use client'

import { Search } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { useSidebar } from '@/shared/ui/sidebar'
import { useSearchStore } from '@/shared/stores/search-store'

// Botón de ícono que abre el buscador de módulos (CommandMenu). Vive en la fila del header
// del sidebar, junto al selector de empresa y al botón de contraer (estilo ChatGPT).
// Contraído queda debajo del logo; en mobile cierra el panel lateral antes de abrir.
export function SidebarSearch() {
  const { isMobile, state, setOpenMobile } = useSidebar()
  const setOpen = useSearchStore((s) => s.setOpen)
  const isCollapsed = state === 'collapsed' && !isMobile

  const handleClick = () => {
    if (isMobile) setOpenMobile(false)
    setOpen(true)
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClick}
          aria-label="Buscar módulo"
          className="size-8 shrink-0 text-sidebar-foreground/70 hover:bg-sidebar-primary/20 hover:text-sidebar-foreground"
        >
          <Search className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side={isCollapsed ? 'right' : 'bottom'}>Buscar (Ctrl K)</TooltipContent>
    </Tooltip>
  )
}
