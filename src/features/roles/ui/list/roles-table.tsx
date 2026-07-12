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
import { useRoleListStore } from '@/features/roles/stores/useRoleListStore'
import { useRoleDeleteStore } from '@/features/roles/stores/useRoleDeleteStore'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { swalDeleteConfirm } from '@/shared/lib/swal'
import { RolesError } from '../roles-error'
import { rolesColumns } from './roles-columns'

export function RolesTable() {
  const { roles, meta, filters, hasLoaded, isInitialLoading, isFetching, isError, message, load, reset } =
    useRoleListStore()
  const { bulkToggleState, bulkDeleteItems } = useRoleDeleteStore()

  const [rowSelection, setRowSelection]     = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting]               = useState<SortingState>([])
  const [search, setSearch]                 = useState(filters.search ?? '')
  const [state, setState]                   = useState<string>(filters.state !== undefined ? String(filters.state) : 'all')
  const [dateFrom, setDateFrom]             = useState(filters.date_from ?? '')
  const [dateTo, setDateTo]                 = useState(filters.date_to ?? '')
  const [isBulkLoading, setIsBulkLoading]   = useState(false)

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

    const timeout = window.setTimeout(() => {
      void load({
        search,
        state: state === 'all' ? undefined : Number(state),
        date_from: dateFrom,
        date_to: dateTo,
        page: 1,
      })
    }, 500)
    return () => window.clearTimeout(timeout)
  }, [search, state, dateFrom, dateTo])

  const table = useReactTable({
    data: roles,
    columns: rolesColumns,
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

  const resetFilters = () => {
    setSearch(''); setState('all'); setDateFrom(''); setDateTo('')
    void load({ search: '', state: undefined, date_from: '', date_to: '', page: 1 })
  }

  const handleBulkActivate = async () => {
    setIsBulkLoading(true)
    try {
      const ids = selectedRows.map((r) => r.original.id)
      const ok = await bulkToggleState(ids, 1)
      if (ok) { toastSuccess('Roles activados', `${selectedCount} rol(es) activado(s).`); table.resetRowSelection() }
      else toastError('Error', 'No se pudieron activar todos los roles.')
    } finally { setIsBulkLoading(false) }
  }

  const handleBulkDeactivate = async () => {
    setIsBulkLoading(true)
    try {
      const ids = selectedRows.map((r) => r.original.id)
      const ok = await bulkToggleState(ids, 0)
      if (ok) { toastSuccess('Roles desactivados', `${selectedCount} rol(es) desactivado(s).`); table.resetRowSelection() }
      else toastError('Error', 'No se pudieron desactivar todos los roles.')
    } finally { setIsBulkLoading(false) }
  }

  const handleBulkDelete = async () => {
    await swalDeleteConfirm(
      `¿Eliminar ${selectedCount} rol(es)?`, 'Esta acción no se puede deshacer.',
      async ({ close, showError }) => {
        const ids = selectedRows.map((r) => r.original.id)
        const ok = await bulkDeleteItems(ids)
        if (ok) {
          toastSuccess('Roles eliminados', `${selectedCount} rol(es) eliminado(s).`)
          table.resetRowSelection()
          close()
        } else {
          showError('No se pudieron eliminar todos los roles.')
        }
      },
      { title: 'Eliminando...' }
    )
  }

  if (!hasLoaded && !isInitialLoading) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center bg-background">
        <LoaderCircle className="mb-3 size-9 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Cargando roles...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <RolesError
        title="Error al cargar roles"
        message={message ?? 'No se pudieron cargar los roles'}
        isLoading={isFetching}
        showRetryButton
        onRetry={async () => { reset(); await load() }}
      />
    )
  }

  return (
    <div className="relative flex flex-1 flex-col gap-4">
      {isFetching && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center">
          <div className="mt-2 flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground shadow-sm">
            <LoaderCircle className="size-3.5 animate-spin" />
            Actualizando...
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex items-end justify-between gap-2">
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

      {/* Tabla */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="group/row">
                {hg.headers.map((h) => (
                  <TableHead
                    key={h.id}
                    colSpan={h.colSpan}
                    className={cn(
                      'whitespace-nowrap bg-background group-hover/row:bg-muted',
                      (h.column.columnDef.meta as { className?: string })?.className
                    )}
                  >
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
                  className={cn('group/row', selectedCount > 0 && !row.getIsSelected() && 'opacity-60')}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'bg-background align-middle group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        (cell.column.columnDef.meta as { className?: string })?.className
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={rolesColumns.length} className="h-24 text-center">
                  No hay roles para mostrar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        table={table}
        className="mt-auto"
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
