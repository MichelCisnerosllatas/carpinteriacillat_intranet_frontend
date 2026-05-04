'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ChevronRight, Laptop, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/shared/ui/command'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { sidebarData } from '@/shared/config/sidebar-data'
import { useSearchStore } from '@/shared/stores/search-store'
import type { NavLink, NavCollapsible } from '@/shared/config/nav-types'

export function CommandMenu() {
  const router = useRouter()
  const { setTheme } = useTheme()
  const { open, setOpen } = useSearchStore()

  // Global keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(!open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, setOpen])

  const run = (fn: () => void) => {
    setOpen(false)
    fn()
  }

  return (
    <CommandDialog modal open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <ScrollArea type="hover" className="h-72 pe-1">
          <CommandEmpty>No results found.</CommandEmpty>
          {sidebarData.navGroups.map((group) => (
            <CommandGroup key={group.title} heading={group.title}>
              {group.items.map((item, i) => {
                const link = item as NavLink
                const collapsible = item as NavCollapsible
                if (link.url)
                  return (
                    <CommandItem key={`${link.url}-${i}`} value={link.title} onSelect={() => run(() => router.push(link.url))}>
                      <div className="flex size-4 items-center justify-center">
                        <ArrowRight className="size-2 text-muted-foreground/80" />
                      </div>
                      {link.title}
                    </CommandItem>
                  )
                return collapsible.items?.map((sub, j) => (
                  <CommandItem key={`${item.title}-${sub.url}-${j}`} value={`${item.title} ${sub.title}`} onSelect={() => run(() => router.push(sub.url))}>
                    <div className="flex size-4 items-center justify-center">
                      <ArrowRight className="size-2 text-muted-foreground/80" />
                    </div>
                    {item.title} <ChevronRight className="size-3 mx-1" /> {sub.title}
                  </CommandItem>
                ))
              })}
            </CommandGroup>
          ))}
          <CommandSeparator />
          <CommandGroup heading="Theme">
            <CommandItem onSelect={() => run(() => setTheme('light'))}>
              <Sun className="mr-2 size-4" /> Light
            </CommandItem>
            <CommandItem onSelect={() => run(() => setTheme('dark'))}>
              <Moon className="mr-2 size-4 scale-90" /> Dark
            </CommandItem>
            <CommandItem onSelect={() => run(() => setTheme('system'))}>
              <Laptop className="mr-2 size-4" /> System
            </CommandItem>
          </CommandGroup>
        </ScrollArea>
      </CommandList>
    </CommandDialog>
  )
}
