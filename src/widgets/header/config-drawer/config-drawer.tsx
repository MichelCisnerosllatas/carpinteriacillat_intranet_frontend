'use client'

import { Settings } from 'lucide-react'
import { useLayout } from '@/shared/providers/layout-provider'
import { useTheme } from '@/shared/providers/theme-provider'
import { Button } from '@/shared/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/ui/sheet'
import { useSidebar } from '@/shared/ui/sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { ThemeConfig } from './theme-config'
import { SidebarConfig } from './sidebar-config'
import { LayoutConfig } from './layout-config'
import { DirConfig } from './dir-config'

// ─── Main export ─────────────────────────────────────────────────────────────

export function ConfigDrawer() {
  const { setOpen } = useSidebar()
  const { resetTheme } = useTheme()
  const { resetLayout } = useLayout()

  const handleReset = () => {
    setOpen(true)
    resetTheme()
    resetLayout()
    document.documentElement.setAttribute('dir', 'ltr')
  }

  return (
    <Sheet>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost" aria-label="Open theme settings" className="rounded-full">
                <Settings aria-hidden="true" />
              </Button>
            </SheetTrigger>
          </span>
        </TooltipTrigger>
        <TooltipContent>Configurar apariencia</TooltipContent>
      </Tooltip>
      <SheetContent className="flex flex-col">
        <SheetHeader className="pb-0 text-start">
          <SheetTitle>Theme Settings</SheetTitle>
          <SheetDescription>
            Adjust the appearance and layout to suit your preferences.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-6 overflow-y-auto px-4">
          <ThemeConfig />
          <SidebarConfig />
          <LayoutConfig />
          <DirConfig />
        </div>
        <SheetFooter className="gap-2">
          <Button variant="destructive" onClick={handleReset} aria-label="Reset all settings">
            Reset
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
