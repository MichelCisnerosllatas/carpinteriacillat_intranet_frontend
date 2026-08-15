'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, LoaderCircle, Navigation2 } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/collapsible'
import { cn } from '@/shared/lib/utils'
import { ENTITY_STATES } from '@/shared/config/entity-states'
import { TableLoadingBar } from '@/shared/ui/data-table/table-loading-bar'
import { useSectionListStore } from '../../stores/useSectionListStore'
import { SectionsGroupTable } from './sections-group-table'
import { SectionStatsBar } from './section-stats-bar'
import type { Section } from '../../data/schema'

/** Trae todo de una vez (no pagina) — el listado se agrupa por navegación, así que no
 * tiene sentido paginar server-side: se vería una navegación distinta en cada página. */
const GROUPED_PER_PAGE = 100

type NavigationGroup = {
  key: string
  navigationName: string
  navigationUrl: string | null
  sections: Section[]
}

function groupByNavigation(items: Section[]): NavigationGroup[] {
  const map = new Map<string, NavigationGroup>()
  for (const item of items) {
    const key = item.idNavigation != null ? String(item.idNavigation) : 'none'
    if (!map.has(key)) {
      map.set(key, {
        key,
        navigationName: item.navigationName ?? 'Sin navegación',
        navigationUrl: item.navigationUrl,
        sections: [],
      })
    }
    map.get(key)!.sections.push(item)
  }
  return Array.from(map.values()).sort((a, b) => a.navigationName.localeCompare(b.navigationName))
}

export function SectionsTable() {
  const { items, meta, filters, hasLoaded, isInitialLoading, isFetching, isError, message, load, reset } = useSectionListStore()

  const [search, setSearch]     = useState(filters.search ?? '')
  const [state, setState]       = useState<string>(filters.state !== undefined ? String(filters.state) : 'all')
  const [dateFrom, setDateFrom] = useState(filters.date_from ?? '')
  const [dateTo, setDateTo]     = useState(filters.date_to ?? '')
  const [openGroups, setOpenGroups] = useState<string[]>([])
  /** true solo mientras hay un fetch disparado por el usuario (filtro/búsqueda/paginación) — no en la carga automática al entrar al módulo. Controla la TableLoadingBar. */
  const [isUserFetching, setIsUserFetching] = useState(false)

  const appliedFilters = useRef({ search, state, dateFrom, dateTo })

  useEffect(() => { void load({ per_page: GROUPED_PER_PAGE, page: 1 }) }, [])

  useEffect(() => {
    const prev = appliedFilters.current
    const changed =
      prev.search !== search ||
      prev.state !== state ||
      prev.dateFrom !== dateFrom ||
      prev.dateTo !== dateTo
    appliedFilters.current = { search, state, dateFrom, dateTo }
    if (!changed) return

    const t = window.setTimeout(() => {
      setIsUserFetching(true)
      void load({
        search, state: state === 'all' ? undefined : Number(state),
        date_from: dateFrom, date_to: dateTo,
        per_page: GROUPED_PER_PAGE, page: 1,
      }).finally(() => setIsUserFetching(false))
    }, 500)
    return () => window.clearTimeout(t)
  }, [search, state, dateFrom, dateTo])

  const groups = useMemo(() => groupByNavigation(items), [items])

  // Abre por defecto cualquier grupo nuevo que aparezca (ej. tras un filtro), sin volver
  // a abrir uno que el usuario haya colapsado manualmente. Se ajusta durante el render
  // (patrón recomendado por React para derivar estado de un valor que cambia) en vez de
  // un useEffect, para no disparar un set-state síncrono dentro del efecto.
  const groupKeys = groups.map((g) => g.key).join(',')
  const [seenGroupKeys, setSeenGroupKeys] = useState('')
  if (groupKeys !== seenGroupKeys) {
    const prevKeys = seenGroupKeys ? seenGroupKeys.split(',') : []
    const newKeys = groups.map((g) => g.key).filter((k) => !prevKeys.includes(k))
    setSeenGroupKeys(groupKeys)
    if (newKeys.length) setOpenGroups((prev) => [...prev, ...newKeys])
  }

  const activeCount   = items.filter((i) => i.stateValue === 1).length
  const inactiveCount = items.filter((i) => i.stateValue !== 1).length

  const resetFilters = () => {
    setSearch(''); setState('all'); setDateFrom(''); setDateTo('')
    setIsUserFetching(true)
    void load({ search: '', state: undefined, date_from: '', date_to: '', per_page: GROUPED_PER_PAGE, page: 1 }).finally(() => setIsUserFetching(false))
  }

  if (!hasLoaded && !isInitialLoading) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center">
        <LoaderCircle className="mb-3 size-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Cargando secciones...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
        <p className="text-sm font-semibold">Error al cargar secciones</p>
        {message && <p className="text-xs text-muted-foreground">{message}</p>}
        <Button size="sm" variant="outline" onClick={() => { reset(); void load({ per_page: GROUPED_PER_PAGE, page: 1 }) }}>Reintentar</Button>
      </div>
    )
  }

  return (
    <div className="relative flex flex-1 flex-col gap-4">
      <SectionStatsBar total={meta?.total ?? 0} active={activeCount} inactive={inactiveCount} />

      <TableLoadingBar active={isUserFetching} />

      <div className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Buscar</span>
          <Input placeholder="Nombre o descripción..." value={search} disabled={isFetching} onChange={(e) => setSearch(e.target.value)} className="h-8 w-full sm:w-[220px]" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Estado</span>
          <Select value={state} disabled={isFetching} onValueChange={setState}>
            <SelectTrigger className="h-8 w-full sm:w-[155px]"><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {ENTITY_STATES.map((s) => <SelectItem key={s.value} value={String(s.value)}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Fecha desde</span>
          <Input type="date" value={dateFrom} disabled={isFetching} onChange={(e) => setDateFrom(e.target.value)} className="h-8 w-full sm:w-[145px]" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Fecha hasta</span>
          <Input type="date" value={dateTo} disabled={isFetching} onChange={(e) => setDateTo(e.target.value)} className="h-8 w-full sm:w-[145px]" />
        </div>
        <div className="flex flex-col justify-end">
          <Button variant="ghost" size="sm" disabled={isFetching} onClick={resetFilters}>Limpiar</Button>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="flex min-h-[160px] items-center justify-center rounded-lg border text-sm text-muted-foreground">
          No hay secciones para mostrar.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {groups.map((g) => {
            const isOpen = openGroups.includes(g.key)
            return (
              <div key={g.key} className="overflow-hidden rounded-lg border bg-card">
                <Collapsible
                  open={isOpen}
                  onOpenChange={(next) => setOpenGroups((prev) => (next ? [...prev, g.key] : prev.filter((k) => k !== g.key)))}
                >
                  <CollapsibleTrigger asChild>
                    <button type="button" className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/40">
                      <Navigation2 className="size-4 shrink-0 text-muted-foreground" />
                      <span className="text-sm font-medium">{g.navigationName}</span>
                      {g.navigationUrl && (
                        <code className="hidden rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground sm:inline">{g.navigationUrl}</code>
                      )}
                      <Badge variant="secondary" className="ml-auto shrink-0 text-xs font-normal">
                        {g.sections.length} sección{g.sections.length === 1 ? '' : 'es'}
                      </Badge>
                      <ChevronDown className={cn('size-4 shrink-0 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="border-t px-3 py-3">
                    <SectionsGroupTable sections={g.sections} />
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
