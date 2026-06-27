'use client'

import { useEffect, useState } from 'react'
import {
  CheckCircle2, ChevronLeft, ChevronRight, Eye, LoaderCircle,
  MoreHorizontal, Pencil, Sofa, Trash2, XCircle,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { DataTableBulkActions } from '@/shared/ui/data-table/bulk-actions'
import { ENTITY_STATES, getStateOption } from '@/shared/config/entity-states'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { swalConfirm, swalDeleteConfirm } from '@/shared/lib/swal'
import { useFurnitureListStore } from '../stores/useFurnitureListStore'
import { useFurnitureDeleteStore } from '../stores/useFurnitureDeleteStore'
import type { Furniture } from '../data/schema'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'

// ─── Stats ────────────────────────────────────────────────────────────────────

function StatsBar({ total, active, inactive }: { total: number; active: number; inactive: number }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { label: 'Total',     value: total,    color: 'text-foreground' },
        { label: 'Activos',   value: active,   color: 'text-teal-600 dark:text-teal-400' },
        { label: 'Inactivos', value: inactive, color: 'text-neutral-500' },
      ].map(({ label, value, color }) => (
        <div key={label} className="flex flex-col items-center rounded-lg border bg-background p-3">
          <span className={cn('text-2xl font-bold tabular-nums', color)}>{value}</span>
          <span className="mt-0.5 text-xs text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function GridPagination({
  meta,
  onPageChange,
  onPageSizeChange,
}: {
  meta: MetaPaginationType
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        Mostrando {meta.from ?? 0}–{meta.to ?? 0} de {meta.total ?? 0} registros
      </p>
      <div className="flex items-center gap-2">
        <Select value={String(meta.per_page)} onValueChange={(v) => onPageSizeChange(Number(v))}>
          <SelectTrigger className="h-8 w-[90px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[8, 12, 24, 48].map((n) => (
              <SelectItem key={n} value={String(n)}>{n} / pág.</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1">
          <Button
            variant="outline" size="icon" className="h-8 w-8"
            disabled={meta.current_page <= 1}
            onClick={() => onPageChange(meta.current_page - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-[60px] text-center text-sm">
            {meta.current_page} / {meta.last_page}
          </span>
          <Button
            variant="outline" size="icon" className="h-8 w-8"
            disabled={meta.current_page >= meta.last_page}
            onClick={() => onPageChange(meta.current_page + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function FurnitureCard({
  item,
  isSelected,
  onToggleSelect,
  onView,
  onEdit,
  onToggleState,
  onDelete,
}: {
  item: Furniture
  isSelected: boolean
  onToggleSelect: () => void
  onView: () => void
  onEdit: () => void
  onToggleState: () => void
  onDelete: () => void
}) {
  const stateOpt = getStateOption(item.stateValue)
  const isActive = item.stateValue === 1

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-200 hover:shadow-md',
        isSelected && 'ring-2 ring-primary',
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2">
            <Sofa className="size-10 text-muted-foreground/30" />
            <span className="text-[11px] text-muted-foreground/50">Sin imagen</span>
          </div>
        )}

        {/* Status badge */}
        <div className="absolute right-2 top-2">
          <Badge
            variant="outline"
            className={cn('bg-background/85 text-xs backdrop-blur-sm', stateOpt.badge)}
          >
            {stateOpt.label}
          </Badge>
        </div>

        {/* Checkbox */}
        <div className="absolute left-2 top-2">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggleSelect}
            className="border-background/80 bg-background/85 backdrop-blur-sm"
            aria-label="Seleccionar"
          />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div>
          <h3 className="line-clamp-1 text-sm font-semibold leading-tight">{item.name}</h3>
          {item.description && (
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-[10px] font-normal">{item.categoryName}</Badge>
          <Badge variant="outline"   className="text-[10px] font-normal">{item.typecolorName}</Badge>
          <Badge variant="outline"   className="text-[10px] font-normal">{item.typewoodName}</Badge>
        </div>

        {(item.largo != null || item.ancho != null) && (
          <p className="text-[11px] text-muted-foreground/70">
            {[
              item.largo != null && `${item.largo} cm largo`,
              item.ancho != null && `${item.ancho} cm ancho`,
            ].filter(Boolean).join(' × ')}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t px-3 py-2">
        <Button size="sm" variant="ghost" className="h-7 gap-1.5 px-2 text-xs" onClick={onView}>
          <Eye className="size-3.5" /> Ver detalle
        </Button>
        <div className="flex items-center gap-0.5">
          <Button size="icon" variant="ghost" className="size-7" onClick={onEdit} title="Editar">
            <Pencil className="size-3.5" />
          </Button>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="size-7">
                <MoreHorizontal className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={onToggleState}>
                {isActive
                  ? <><XCircle className="mr-2 size-4 text-orange-500" />Desactivar</>
                  : <><CheckCircle2 className="mr-2 size-4 text-teal-500" />Activar</>}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-red-500!">
                <Trash2 className="mr-2 size-4" />Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function FurnituresTable() {
  const router = useRouter()
  const {
    items, meta, filters, hasLoaded, isInitialLoading, isFetching, isError, message,
    load, reset, setCurrentItem,
  } = useFurnitureListStore()
  const { toggleState, deleteItem, bulkToggleState, bulkDeleteItems } = useFurnitureDeleteStore()

  const [selected, setSelected]   = useState<Set<number>>(new Set())
  const [search, setSearch]       = useState(filters.search ?? '')
  const [state, setState]         = useState<string>(filters.state !== undefined ? String(filters.state) : 'all')
  const [dateFrom, setDateFrom]   = useState(filters.date_from ?? '')
  const [dateTo, setDateTo]       = useState(filters.date_to ?? '')
  const [isBulkLoading, setIsBulkLoading] = useState(false)

  useEffect(() => { void load() }, [])

  useEffect(() => {
    if (!hasLoaded) return
    const t = window.setTimeout(() => {
      void load({ search, state: state === 'all' ? undefined : Number(state), date_from: dateFrom, date_to: dateTo, page: 1 })
    }, 500)
    return () => window.clearTimeout(t)
  }, [search, state, dateFrom, dateTo])

  // Clear selection when items change page
  useEffect(() => { setSelected(new Set()) }, [filters.page])

  const toggleSelect = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const allSelected  = items.length > 0 && items.every((i) => selected.has(i.id))
  const someSelected = items.some((i) => selected.has(i.id))

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(items.map((i) => i.id)))

  const resetFilters = () => {
    setSearch(''); setState('all'); setDateFrom(''); setDateTo('')
    void load({ search: '', state: undefined, date_from: '', date_to: '', page: 1 })
  }

  // ── Card actions ──
  const handleView = (item: Furniture) => {
    setCurrentItem(item); NProgress.start(); router.push(`/furnitures/${item.id}`)
  }
  const handleEdit = (item: Furniture) => {
    setCurrentItem(item); NProgress.start(); router.push(`/furnitures/edit/${item.id}`)
  }
  const handleToggleState = async (item: Furniture) => {
    const newState    = item.stateValue === 1 ? 0 : 1
    const actionLabel = newState === 1 ? 'Activar' : 'Desactivar'
    const confirmed   = await swalConfirm({ title: `¿${actionLabel} este mueble?`, text: item.name, confirmText: 'Sí, continuar', cancelText: 'Cancelar' })
    if (!confirmed) return
    const ok = await toggleState(item.id, newState)
    if (ok) toastSuccess(`Mueble ${newState === 1 ? 'activado' : 'desactivado'}`, `"${item.name}" fue ${newState === 1 ? 'activado' : 'desactivado'}.`)
    else    toastError('Error', 'No se pudo cambiar el estado.')
  }
  const handleDelete = async (item: Furniture) => {
    const confirmed = await swalDeleteConfirm(`¿Eliminar "${item.name}"?`, 'Esta acción no se puede deshacer.')
    if (!confirmed) return
    const ok = await deleteItem(item.id)
    if (ok) toastSuccess('Mueble eliminado', `"${item.name}" fue eliminado.`)
    else    toastError('Error al eliminar', 'No se pudo eliminar el registro.')
  }

  // ── Bulk actions ──
  const selectedIds   = Array.from(selected)
  const selectedCount = selectedIds.length

  const handleBulkActivate = async () => {
    setIsBulkLoading(true)
    try {
      const ok = await bulkToggleState(selectedIds, 1)
      if (ok) { toastSuccess('Activados', `${selectedCount} mueble(s) activado(s).`); setSelected(new Set()) }
      else toastError('Error', 'No se pudieron activar todos los registros.')
    } finally { setIsBulkLoading(false) }
  }
  const handleBulkDeactivate = async () => {
    setIsBulkLoading(true)
    try {
      const ok = await bulkToggleState(selectedIds, 0)
      if (ok) { toastSuccess('Desactivados', `${selectedCount} mueble(s) desactivado(s).`); setSelected(new Set()) }
      else toastError('Error', 'No se pudieron desactivar todos los registros.')
    } finally { setIsBulkLoading(false) }
  }
  const handleBulkDelete = async () => {
    const confirmed = await swalDeleteConfirm(`¿Eliminar ${selectedCount} mueble(s)?`, 'Esta acción no se puede deshacer.')
    if (!confirmed) return
    setIsBulkLoading(true)
    try {
      const ok = await bulkDeleteItems(selectedIds)
      if (ok) { toastSuccess('Eliminados', `${selectedCount} mueble(s) eliminado(s).`); setSelected(new Set()) }
      else toastError('Error', 'No se pudieron eliminar todos los registros.')
    } finally { setIsBulkLoading(false) }
  }

  // ── Loading / error states ──
  if (!hasLoaded && !isInitialLoading) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center">
        <LoaderCircle className="mb-3 size-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Cargando muebles...</p>
      </div>
    )
  }
  if (isError) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
        <p className="text-sm font-semibold">Error al cargar muebles</p>
        {message && <p className="text-xs text-muted-foreground">{message}</p>}
        <Button size="sm" variant="outline" onClick={() => { reset(); void load() }}>Reintentar</Button>
      </div>
    )
  }

  const activeCount   = items.filter((i) => i.stateValue === 1).length
  const inactiveCount = items.filter((i) => i.stateValue !== 1).length

  return (
    <div className="relative flex flex-1 flex-col gap-4">
      <StatsBar total={meta?.total ?? 0} active={activeCount} inactive={inactiveCount} />

      {/* Fetching indicator */}
      {isFetching && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center">
          <div className="mt-2 flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground shadow-sm">
            <LoaderCircle className="size-3.5 animate-spin" />Actualizando...
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Buscar</span>
          <Input
            placeholder="Nombre o descripción..."
            value={search} disabled={isFetching}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-full sm:w-[220px]"
          />
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

        {/* Select all */}
        {items.length > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <Checkbox
              checked={allSelected ? true : someSelected ? 'indeterminate' : false}
              onCheckedChange={toggleAll}
              id="select-all"
            />
            <label htmlFor="select-all" className="cursor-pointer text-xs text-muted-foreground select-none">
              Seleccionar página
            </label>
          </div>
        )}
      </div>

      {/* Grid */}
      {items.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed">
          <Sofa className="size-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No hay muebles para mostrar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <FurnitureCard
              key={item.id}
              item={item}
              isSelected={selected.has(item.id)}
              onToggleSelect={() => toggleSelect(item.id)}
              onView={() => handleView(item)}
              onEdit={() => handleEdit(item)}
              onToggleState={() => void handleToggleState(item)}
              onDelete={() => void handleDelete(item)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && (
        <GridPagination
          meta={meta}
          onPageChange={(page) => void load({ page })}
          onPageSizeChange={(per_page) => void load({ per_page, page: 1 })}
        />
      )}

      {/* Bulk actions */}
      <DataTableBulkActions
        selectedCount={selectedCount}
        isLoading={isBulkLoading}
        onActivate={handleBulkActivate}
        onDeactivate={handleBulkDeactivate}
        onDelete={handleBulkDelete}
        onClear={() => setSelected(new Set())}
      />
    </div>
  )
}
