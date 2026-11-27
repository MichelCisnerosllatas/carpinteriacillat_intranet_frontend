'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
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
import { sidebarData } from '@/shared/config/sidebar-data'
import { useSearchStore } from '@/shared/stores/search-store'
import { filterNavByPermission } from '@/shared/config/nav-types'
import type { NavLink, NavCollapsible } from '@/shared/config/nav-types'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { hasPermission, isSuperAdminSession } from '@/features/auth/hooks/usePermission'

// Buscador de módulos del sidebar (solo interfaz, sin backend). Se abre con Ctrl/⌘+K
// o desde el botón de búsqueda del sidebar. Respeta los mismos permisos que el sidebar.
export function CommandMenu() {
  const router = useRouter()
  const pathname = usePathname()
  const { setTheme } = useTheme()
  const { open, setOpen, toggle, setRevealActive } = useSearchStore()
  const session = useAuthStore((state) => state.session)

  // Mismo filtro que el sidebar: solo módulos con permiso.
  const groups = useMemo(
    () =>
      filterNavByPermission(
        sidebarData.navGroups,
        (perm) => hasPermission(session, perm),
        isSuperAdminSession(session)
      ),
    [session]
  )

  const [search, setSearch] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  // Atajo global (si cierra el buscador, también limpia la búsqueda)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // El autocompletado de Chrome dispara keydown sin `key`; el `?.` evita romper la página.
      if (e.key?.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        if (useSearchStore.getState().open) setSearch('')
        toggle()
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [toggle])

  // Al filtrar, el primer resultado debe quedar arriba y visible: se reinicia el scroll
  // de la lista en cada cambio del texto.
  const handleSearch = (value: string) => {
    setSearch(value)
    if (listRef.current) listRef.current.scrollTop = 0
  }

  // Al cerrar se limpia la búsqueda para que al reabrir arranque desde cero.
  const handleOpenChange = (value: boolean) => {
    setOpen(value)
    if (!value) setSearch('')
  }

  const run = (fn: () => void) => {
    handleOpenChange(false)
    fn()
  }

  // Navega y avisa al sidebar que lleve el módulo elegido arriba de todo.
  const goTo = (url: string) => {
    // Si ya estás en esa ruta no hay navegación: no se marca (quedaría pendiente).
    if (url !== pathname) setRevealActive(true)
    router.push(url)
  }

  return (
    <CommandDialog
      modal
      open={open}
      onOpenChange={handleOpenChange}
      title="Buscar módulo"
      description="Busca una sección del intranet para ir a ella"
    >
      <CommandInput placeholder="Buscar módulo..." value={search} onValueChange={handleSearch} />
      <CommandList ref={listRef} className="max-h-80">
          <CommandEmpty>Sin resultados.</CommandEmpty>
          {groups.map((group) => (
            <CommandGroup key={group.title} heading={group.title}>
              {group.items.map((item, i) => {
                const link = item as NavLink
                const collapsible = item as NavCollapsible
                if (link.url) {
                  const Icon = link.icon ?? ArrowRight
                  return (
                    <CommandItem
                      key={`${link.url}-${i}`}
                      value={`${group.title} ${link.title} ${link.url}`}
                      onSelect={() => run(() => goTo(link.url))}
                    >
                      <Icon className="text-muted-foreground" />
                      {link.title}
                    </CommandItem>
                  )
                }
                return collapsible.items?.map((sub, j) => {
                  const Icon = sub.icon ?? collapsible.icon ?? ArrowRight
                  return (
                    <CommandItem
                      key={`${item.title}-${sub.url}-${j}`}
                      value={`${group.title} ${item.title} ${sub.title} ${sub.url}`}
                      onSelect={() => run(() => goTo(sub.url))}
                    >
                      <Icon className="text-muted-foreground" />
                      <span className="text-muted-foreground">{item.title}</span>
                      <ChevronRight className="size-3! text-muted-foreground" />
                      {sub.title}
                    </CommandItem>
                  )
                })
              })}
            </CommandGroup>
          ))}
          <CommandSeparator />
          <CommandGroup heading="Tema">
            <CommandItem value="tema claro light" onSelect={() => run(() => setTheme('light'))}>
              <Sun className="text-muted-foreground" /> Claro
            </CommandItem>
            <CommandItem value="tema oscuro dark" onSelect={() => run(() => setTheme('dark'))}>
              <Moon className="scale-90 text-muted-foreground" /> Oscuro
            </CommandItem>
            <CommandItem value="tema sistema system" onSelect={() => run(() => setTheme('system'))}>
              <Laptop className="text-muted-foreground" /> Sistema
            </CommandItem>
          </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
