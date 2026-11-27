'use client'

import { useTheme } from 'next-themes'
import { useLayoutStore } from '@/shared/stores/layout-store'
import { Button } from '@/shared/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet'
import { useSidebar } from '@/shared/ui/sidebar'
import { ThemeSection } from './theme-section'
import { SidebarSection } from './sidebar-section'
import { LayoutSection } from './layout-section'
import { DirectionSection } from './direction-section'

// ─── Main export ─────────────────────────────────────────────────────────────

type AppearanceDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AppearanceDrawer({ open, onOpenChange }: AppearanceDrawerProps) {
  const { setTheme } = useTheme()
  const { reset } = useLayoutStore()
  const { setOpen: setSidebarOpen } = useSidebar()

  const handleReset = () => {
    setSidebarOpen(true)
    setTheme('system')
    reset()
    document.documentElement.setAttribute('dir', 'ltr')
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader className="pb-0 text-start">
          <SheetTitle>Appearance & Layout</SheetTitle>
          <SheetDescription>
            Customize the theme, sidebar style, layout and text direction.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-6 overflow-y-auto px-4">
          <ThemeSection />
          <SidebarSection />
          <LayoutSection />
          <DirectionSection />
        </div>
        <SheetFooter>
          <Button variant="destructive" onClick={handleReset}>
            Reset to defaults
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
