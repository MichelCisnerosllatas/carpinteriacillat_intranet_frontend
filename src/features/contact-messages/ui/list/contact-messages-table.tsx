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
import { TableLoadingBar } from '@/shared/ui/data-table/table-loading-bar'
import { toastSuccess } from '@/shared/lib/toast'
import { swalDeleteConfirm } from '@/shared/lib/swal'
import { CONTACT_MESSAGE_STATUSES, CONTACT_MESSAGE_PROJECT_TYPES } from '../../data/data'
import { useContactMessageListStore } from '../../stores/useContactMessageListStore'
import { useContactMessageDeleteStore } from '../../stores/useContactMessageDeleteStore'
import { contactMessagesColumns } from './contact-messages-columns'
import { ContactMessageStatsBar } from './contact-message-stats-bar'

export function ContactMessagesTable() {
  const { items, meta, filters, hasLoaded, isInitialLoading, isFetching, isError, message, load, reset } =
    useContactMessageListStore()
  const { bulkDeleteItems } = useContactMessageDeleteStore()

  const [rowSelection, setRowSelection]         = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting]                   = useState<SortingState>([])
  const [search, setSearch]                     = useState(filters.search ?? '')
  const [status, setStatus]                     = useState<string>(filters.status ?? 'all')
  const [projectType, setProjectType]           = useState<string>(filters.project_type ?? 'all')
  const [dateFrom, setDateFrom]                 = useState(filters.date_from ?? '')
  const [dateTo, setDateTo]                     = useState(filters.date_to ?? '')
  const [isBulkLoading, setIsBulkLoading]       = useState(false)
  /** true solo mientras hay un fetch disparado por el usuario (filtro/búsqueda/paginación) — no en la carga automática al entrar al módulo. Controla la TableLoadingBar. */
  const [isUserFetching, setIsUserFetching]     = useState(false)

  const pagination = useMemo<PaginationState>(() => ({
    pageIndex: Math.max((filters.page ?? 1) - 1, 0),
    pageSize: filters.per_page ?? 10,
  }), [filters.page, filters.per_page])

  const appliedFilters = useRef({ search, status, projectType, dateFrom, dateTo })

  useEffect(() => { void load() }, [])

  useEffect(() => {
    const prev = appliedFilters.current
    const changed =
      prev.search !== search || prev.status !== status || prev.projectType !== projectType ||
      prev.dateFrom !== dateFrom || prev.dateTo !== dateTo
    appliedFilters.current = { search, status, projectType, dateFrom, dateTo }
    if (!changed) return

    const t = window.setTimeout(() => {
      setIsUserFetching(true)
      void load({
        search,
        status: status === 'all' ? undefined : status,
        project_type: projectType === 'all' ? undefined : projectType,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        page: 1,
      }).finally(() => setIsUserFetching(false))
    }, 500)
    return () => window.clearTimeout(t)
  }, [search, status, projectType, dateFrom, dateTo])

  const table = useReactTable({
    data: items,
    columns: contactMessagesColumns,
    pageCount: meta?.last_page ?? 1,
    manualPagination: true,
    state: { sorting, pagination, rowSelection, columnVisibility },
    enableRowSelection: true,
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater
      setIsUserFetching(true)
      void load({ page: next.pageIndex + 1, per_page: next.pageSize }).finally(() => setIsUserFetching(false))
    },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedCount = selectedRows.length

  const nuevoCount      = items.filter((i) => i.status === 'nuevo').length
  const atendidoCount   = items.filter((i) => i.status === 'atendido').length
  const descartadoCount = items.filter((i) => i.status === 'descartado').length

  const resetFilters = () => {
    setSearch(''); setStatus('all'); setProjectType('all'); setDateFrom(''); setDateTo('')
    setIsUserFetching(true)
    void load({ search: '', status: undefined, project_type: undefined, date_from: undefined, date_to: undefined, page: 1 }).finally(() => setIsUserFetching(false))
  }

  const handleBulkDelete = async () => {
    await swalDeleteConfirm(
      `¿Eliminar ${selectedCount} mensaje(s)?`, 'Esta acción no se puede deshacer.',
      async ({ close, showError }) => {
        const ids = selectedRows.map((r) => r.original.id)
        const ok = await bulkDeleteItems(ids)
        if (ok) {
          toastSuccess('Eliminados', `${selectedCount} mensaje(s) eliminado(s).`)
          table.resetRowSelection()
          close()
        } else {
          showError('No se pudieron eliminar todos los mensajes.')
        }
      },
      { title: 'Eliminando...' }
    )
  }

  if (!hasLoaded && !isInitialLoading) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center">
        <LoaderCircle className="mb-3 size-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Cargando mensajes...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
        <p className="text-sm font-semibold">Error al cargar mensajes</p>
        {message && <p className="text-xs text-muted-foreground">{message}</p>}
        <Button size="sm" variant="outline" onClick={() => { reset(); void load() }}>Reintentar</Button>
      </div>
    )
  }

  return (
    <div className="relative flex flex-1 flex-col gap-4">
      <ContactMessageStatsBar total={meta?.total ?? 0} nuevo={nuevoCount} atendido={atendidoCount} descartado={descartadoCount} />

      <TableLoadingBar active={isUserFetching} />

      <div className="flex items-end justify-between gap-2">
        <div className="flex flex-1 flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Buscar</span>
            <Input placeholder="Nombre, correo, teléfono..." value={search} disabled={isFetching} onChange={(e) => setSearch(e.target.value)} className="h-8 w-full sm:w-[200px]" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Estado</span>
            <Select value={status} disabled={isFetching} onValueChange={setStatus}>
              <SelectTrigger className="h-8 w-full sm:w-[140px]"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {CONTACT_MESSAGE_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Proyecto</span>
            <Select value={projectType} disabled={isFetching} onValueChange={setProjectType}>
              <SelectTrigger className="h-8 w-full sm:w-[170px]"><SelectValue placeholder="Proyecto" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los proyectos</SelectItem>
                {CONTACT_MESSAGE_PROJECT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
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
                <TableCell colSpan={contactMessagesColumns.length} className="h-20 text-center text-sm text-muted-foreground">
                  No hay mensajes para mostrar.
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
        onDelete={async () => { setIsBulkLoading(true); try { await handleBulkDelete() } finally { setIsBulkLoading(false) } }}
        onClear={() => table.resetRowSelection()}
      />
    </div>
  )
}
