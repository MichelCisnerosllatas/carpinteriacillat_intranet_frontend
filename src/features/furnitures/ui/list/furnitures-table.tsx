'use client'

import { useEffect, useState } from 'react'
import { LoaderCircle, Sofa } from 'lucide-react'
import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { DataTableBulkActions } from '@/shared/ui/data-table/bulk-actions'
import { ENTITY_STATES } from '@/shared/config/entity-states'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { swalConfirm, swalDeleteConfirm } from '@/shared/lib/swal'
import { useFurnitureListStore } from '../../stores/useFurnitureListStore'
import { useFurnitureDeleteStore } from '../../stores/useFurnitureDeleteStore'
import type { Furniture } from '../../data/schema'
import { FurnitureStatsBar } from './furniture-stats-bar'
import { FurnitureGridPagination } from './furniture-grid-pagination'
import { FurnitureCard } from './furniture-card'

export function FurnituresTable() {
  const router = useRouter()
  const {
    items, meta, filters, hasLoaded, isInitialLoading, isFetching, isError, message,
    load, reset, setCurrentItem,
  } = useFurnitureListStore()
  const { toggleState, deleteItem, bulkToggleState, bulkDeleteItems } = useFurnitureDeleteStore()

  const [selected, setSelected]         = useState<Set<number>>(new Set())
  const [search, setSearch]             = useState(filters.search ?? '')
  const [state, setState]               = useState<string>(filters.state !== undefined ? String(filters.state) : 'all')
  const [dateFrom, setDateFrom]         = useState(filters.date_from ?? '')
  const [dateTo, setDateTo]             = useState(filters.date_to ?? '')
  const [isBulkLoading, setIsBulkLoading] = useState(false)

  useEffect(() => { void load() }, [])

  useEffect(() => {
    if (!hasLoaded) return
    const t = window.setTimeout(() => {
      void load({ search, state: state === 'all' ? undefined : Number(state), date_from: dateFrom, date_to: dateTo, page: 1 })
    }, 500)
    return () => window.clearTimeout(t)
  }, [search, state, dateFrom, dateTo])

  useEffect(() => { setSelected(new Set()) }, [filters.page])

  const toggleSelect = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const allSelected  = items.length > 0 && items.every((i) => selected.has(i.id))
  const someSelected = items.some((i) => selected.has(i.id))
  const toggleAll    = () => setSelected(allSelected ? new Set() : new Set(items.map((i) => i.id)))

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
      <FurnitureStatsBar total={meta?.total ?? 0} active={activeCount} inactive={inactiveCount} />

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
        <FurnitureGridPagination
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
