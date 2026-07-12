'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import {
  type PaginationState, type SortingState, type VisibilityState,
  flexRender, getCoreRowModel, getSortedRowModel, useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { DataTablePagination } from '@/shared/ui/data-table/pagination'
import { DataTableViewOptions } from '@/shared/ui/data-table/view-options'
import { DataTableBulkActions } from '@/shared/ui/data-table/bulk-actions'
import { ENTITY_STATES } from '@/shared/config/entity-states'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { swalDeleteConfirm } from '@/shared/lib/swal'
import { useTypeFontListStore } from '../../stores/useTypeFontListStore'
import { useTypeFontDeleteStore } from '../../stores/useTypeFontDeleteStore'
import { typefontsColumns } from './typefonts-columns'
import { TypeFontStatsBar } from './typefont-stats-bar'

export function TypeFontsTable() {
  const { items, meta, filters, hasLoaded, isInitialLoading, isFetching, isError, message, load, reset } =
    useTypeFontListStore()
  const { bulkToggleState, bulkDeleteItems } = useTypeFontDeleteStore()

  const [rowSelection, setRowSelection]         = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting]                   = useState<SortingState>([])
  const [search, setSearch]                     = useState(filters.search ?? '')
  const [state, setState]                       = useState<string>(filters.state !== undefined ? String(filters.state) : 'all')
  const [dateFrom, setDateFrom]                 = useState(filters.date_from ?? '')
  const [dateTo, setDateTo]                     = useState(filters.date_to ?? '')
  const [isBulkLoading, setIsBulkLoading]       = useState(false)

  const pagination = useMemo<PaginationState>(() => ({
    pageIndex: Math.max((filters.page ?? 1) - 1, 0),
    pageSize: filters.per_page ?? 10,
  }), [filters.page, filters.per_page])

  const appliedFilters = useRef({ search, state, dateFrom, dateTo })

  useEffect(() => { void load() }, [])

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
      void load({ search, state: state === 'all' ? undefined : Number(state), date_from: dateFrom, date_to: dateTo, page: 1 })
    }, 500)
    return () => window.clearTimeout(t)
  }, [search, state, dateFrom, dateTo])

  const table = useReactTable({
    data: items,
    columns: typefontsColumns,
    pageCount: meta?.last_page ?? 1,
    manualPagination: true,
    state: { sorting, pagination, rowSelection, columnVisibility },
    enableRowSelection: true,
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater
      void load({ page: next.pageIndex + 1, per_page: next.pageSize })
    },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedCount = selectedRows.length

  const activeCount   = items.filter((i) => i.stateValue === 1).length
  const inactiveCount = items.filter((i) => i.stateValue !== 1).length

  const resetFilters = () => {
    setSearch(''); setState('all'); setDateFrom(''); setDateTo('')
    void load({ search: '', state: undefined, date_from: '', date_to: '', page: 1 })
  }

  const handleBulkActivate = async () => {
    setIsBulkLoading(true)
    const ok = await bulkToggleState(selectedRows.map((r) => r.original.id), 1)
    if (ok) { toastSuccess('Activadas', `${selectedCount} registro(s) activado(s).`); table.resetRowSelection() }
    else toastError('Error', 'No se pudieron activar todos los registros.')
    setIsBulkLoading(false)
  }

  const handleBulkDeactivate = async () => {
    setIsBulkLoading(true)
    const ok = await bulkToggleState(selectedRows.map((r) => r.original.id), 0)
    if (ok) { toastSuccess('Desactivadas', `${selectedCount} registro(s) desactivado(s).`); table.resetRowSelection() }
    else toastError('Error', 'No se pudieron desactivar todos los registros.')
    setIsBulkLoading(false)
  }

  const handleBulkDelete = async () => {
    await swalDeleteConfirm(
      `¿Eliminar ${selectedCount} registro(s)?`, 'Esta acción no se puede deshacer.',
      async ({ close, showError }) => {
        const ok = await bulkDeleteItems(selectedRows.map((r) => r.original.id))
        if (ok) {
          toastSuccess('Eliminadas', `${selectedCount} registro(s) eliminado(s).`)
          table.resetRowSelection()
          close()
        } else {
          showError('No se pudieron eliminar todos los registros.')
        }
      },
      { title: 'Eliminando...' }
    )
  }

  if (!hasLoaded && !isInitialLoading) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center">
        <LoaderCircle className="mb-3 size-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Cargando tipografías...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
        <p className="text-sm font-semibold">Error al cargar tipografías</p>
        {message && <p className="text-xs text-muted-foreground">{message}</p>}
        <Button size="sm" variant="outline" onClick={() => { reset(); void load() }}>Reintentar</Button>
      </div>
    )
  }

  return (
    <div className="relative flex flex-1 flex-col gap-4">
      <TypeFontStatsBar total={meta?.total ?? 0} active={activeCount} inactive={inactiveCount} />

      {isFetching && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center">
          <div className="mt-2 flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground shadow-sm">
            <LoaderCircle className="size-3.5 animate-spin" />Actualizando...
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-1 flex-wrap items-end gap-2">
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
        <DataTableViewOptions table={table} />
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id} colSpan={h.colSpan} className={cn('bg-muted/50 text-xs', (h.column.columnDef.meta as any)?.className)}>
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={cn('transition-colors', selectedCount > 0 && !row.getIsSelected() && 'opacity-50')}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cn('py-2', (cell.column.columnDef.meta as any)?.className)}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={typefontsColumns.length} className="h-20 text-center text-sm text-muted-foreground">
                  No hay tipografías para mostrar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} className="mt-auto"
        summary={meta ? `Mostrando ${meta.from ?? 0} - ${meta.to ?? 0} de ${meta.total ?? 0} registros` : 'Sin registros'}
      />

      <DataTableBulkActions
        selectedCount={selectedCount}
        isLoading={isBulkLoading}
        onActivate={handleBulkActivate}
        onDeactivate={handleBulkDeactivate}
        onDelete={handleBulkDelete}
        onClear={() => table.resetRowSelection()}
      />
    </div>
  )
}
