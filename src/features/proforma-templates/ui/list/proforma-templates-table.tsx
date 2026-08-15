'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import {
  type PaginationState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { DataTablePagination } from '@/shared/ui/data-table/pagination'
import { DataTableViewOptions } from '@/shared/ui/data-table/view-options'
import { DataTableBulkActions } from '@/shared/ui/data-table/bulk-actions'
import { TableLoadingBar } from '@/shared/ui/data-table/table-loading-bar'
import { ENTITY_STATES } from '@/shared/config/entity-states'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { swalDeleteConfirm } from '@/shared/lib/swal'
import { useProformaTypeSelectStore } from '@/features/proforma-types'
import { useProformaTemplateListStore } from '../../stores/useProformaTemplateListStore'
import { useProformaTemplateDeleteStore } from '../../stores/useProformaTemplateDeleteStore'
import { proformaTemplatesColumns } from './proforma-templates-columns'
import { ProformaTemplateStatsBar } from './proforma-template-stats-bar'

export function ProformaTemplatesTable() {
  const {
    items,
    meta,
    filters,
    hasLoaded,
    isInitialLoading,
    isFetching,
    isError,
    message,
    load,
    reset,
  } = useProformaTemplateListStore()
  const { bulkToggleState, bulkDeleteItems } = useProformaTemplateDeleteStore()
  const { load: loadProformaTypes } = useProformaTypeSelectStore()

  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [search, setSearch] = useState(filters.search ?? '')
  const [status, setStatus] = useState<string>(
    filters.status !== undefined ? String(filters.status) : 'all'
  )
  const [isBulkLoading, setIsBulkLoading] = useState(false)
  /** true solo mientras hay un fetch disparado por el usuario (filtro/búsqueda/paginación) — no en la carga automática al entrar al módulo. Controla la TableLoadingBar. */
  const [isUserFetching, setIsUserFetching] = useState(false)

  const pagination = useMemo<PaginationState>(
    () => ({
      pageIndex: Math.max((filters.page ?? 1) - 1, 0),
      pageSize: filters.per_page ?? 10,
    }),
    [filters.page, filters.per_page]
  )

  const appliedFilters = useRef({ search, status })

  useEffect(() => {
    void loadProformaTypes().then(() => load())
  }, [])

  useEffect(() => {
    const prev = appliedFilters.current
    const changed = prev.search !== search || prev.status !== status
    appliedFilters.current = { search, status }
    if (!changed) return

    const t = window.setTimeout(() => {
      setIsUserFetching(true)
      void load({ search, status: status === 'all' ? undefined : Number(status), page: 1 }).finally(
        () => setIsUserFetching(false)
      )
    }, 500)
    return () => window.clearTimeout(t)
  }, [search, status])

  const table = useReactTable({
    data: items,
    columns: proformaTemplatesColumns,
    pageCount: meta?.last_page ?? 1,
    manualPagination: true,
    state: { sorting, pagination, rowSelection, columnVisibility },
    enableRowSelection: true,
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater
      setIsUserFetching(true)
      void load({ page: next.pageIndex + 1, per_page: next.pageSize }).finally(() =>
        setIsUserFetching(false)
      )
    },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedCount = selectedRows.length

  const activeCount = items.filter((i) => i.stateValue === 1).length
  const inactiveCount = items.filter((i) => i.stateValue !== 1).length

  const resetFilters = () => {
    setSearch('')
    setStatus('all')
    setIsUserFetching(true)
    void load({ search: '', status: undefined, page: 1 }).finally(() => setIsUserFetching(false))
  }

  const handleBulkActivate = async () => {
    setIsBulkLoading(true)
    try {
      const ok = await bulkToggleState(
        selectedRows.map((r) => r.original.id),
        1
      )
      if (ok) {
        toastSuccess('Activados', `${selectedCount} registro(s) activado(s).`)
        table.resetRowSelection()
      } else toastError('Error', 'No se pudieron activar todos los registros.')
    } finally {
      setIsBulkLoading(false)
    }
  }

  const handleBulkDeactivate = async () => {
    setIsBulkLoading(true)
    try {
      const ok = await bulkToggleState(
        selectedRows.map((r) => r.original.id),
        0
      )
      if (ok) {
        toastSuccess('Desactivados', `${selectedCount} registro(s) desactivado(s).`)
        table.resetRowSelection()
      } else toastError('Error', 'No se pudieron desactivar todos los registros.')
    } finally {
      setIsBulkLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    await swalDeleteConfirm(
      `¿Eliminar ${selectedCount} registro(s)?`,
      'Esta acción no se puede deshacer.',
      async ({ close, showError }) => {
        const ids = selectedRows.map((r) => r.original.id)
        const ok = await bulkDeleteItems(ids)
        if (ok) {
          toastSuccess('Eliminados', `${selectedCount} registro(s) eliminado(s).`)
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
        <LoaderCircle className="text-muted-foreground mb-3 size-8 animate-spin" />
        <p className="text-muted-foreground text-sm">Cargando plantillas de proforma...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
        <p className="text-sm font-semibold">Error al cargar plantillas de proforma</p>
        {message && <p className="text-muted-foreground text-xs">{message}</p>}
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            reset()
            void load()
          }}
        >
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="relative flex flex-1 flex-col gap-4">
      <ProformaTemplateStatsBar
        total={meta?.total ?? 0}
        active={activeCount}
        inactive={inactiveCount}
      />

      <TableLoadingBar active={isUserFetching} />

      <div className="flex items-end justify-between gap-2">
        <div className="flex flex-1 flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">Buscar</span>
            <Input
              placeholder="Nombre o familia tipográfica..."
              value={search}
              disabled={isFetching}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-full sm:w-[240px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">Estado</span>
            <Select value={status} disabled={isFetching} onValueChange={setStatus}>
              <SelectTrigger className="h-8 w-full sm:w-[155px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {ENTITY_STATES.map((s) => (
                  <SelectItem key={s.value} value={String(s.value)}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col justify-end">
            <Button variant="ghost" size="sm" disabled={isFetching} onClick={resetFilters}>
              Limpiar
            </Button>
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
                  <TableHead
                    key={h.id}
                    colSpan={h.colSpan}
                    className={cn(
                      'bg-muted/50 text-xs',
                      (h.column.columnDef.meta as any)?.className
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
                  className={cn(
                    'transition-colors',
                    selectedCount > 0 && !row.getIsSelected() && 'opacity-50'
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn('py-2', (cell.column.columnDef.meta as any)?.className)}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={proformaTemplatesColumns.length}
                  className="text-muted-foreground h-20 text-center text-sm"
                >
                  No hay plantillas de proforma para mostrar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        table={table}
        className="mt-auto"
        summary={
          meta
            ? `Mostrando ${meta.from ?? 0} - ${meta.to ?? 0} de ${meta.total ?? 0} registros`
            : 'Sin registros'
        }
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
