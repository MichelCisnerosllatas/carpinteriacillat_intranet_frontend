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
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { swalDeleteConfirm } from '@/shared/lib/swal'
import { ClientSelect } from '@/features/clients'
import { useSaleListStore } from '../../stores/useSaleListStore'
import { useSaleDeleteStore } from '../../stores/useSaleDeleteStore'
import { SALE_STATUS_OPTIONS, SALE_PAYMENT_STATUS_OPTIONS } from '../../data/data'
import type { SaleStatus, SalePaymentStatus } from '../../data/schema'
import { salesColumns } from './sales-columns'

export function SalesTable() {
  const { items, meta, filters, hasLoaded, isInitialLoading, isFetching, isError, message, load, reset } =
    useSaleListStore()
  const { bulkDeleteItems } = useSaleDeleteStore()

  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [search, setSearch] = useState(filters.search ?? '')
  const [status, setStatus] = useState<string>(filters.status ?? 'all')
  const [paymentStatus, setPaymentStatus] = useState<string>(filters.payment_status ?? 'all')
  const [clientId, setClientId] = useState<number | null>(filters.client_id ?? null)
  const [dateFrom, setDateFrom] = useState(filters.date_from ?? '')
  const [dateTo, setDateTo] = useState(filters.date_to ?? '')
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

  const appliedSearch = useRef(search)

  useEffect(() => {
    void load()
  }, [])

  // "Buscar" es texto libre: se espera a que el usuario deje de escribir (debounce) antes de
  // disparar la petición y encender la barra, para no parpadear en cada tecla.
  useEffect(() => {
    if (appliedSearch.current === search) return
    appliedSearch.current = search

    const t = window.setTimeout(() => {
      setIsUserFetching(true)
      void load({
        search,
        status: status === 'all' ? undefined : (status as SaleStatus),
        payment_status: paymentStatus === 'all' ? undefined : (paymentStatus as SalePaymentStatus),
        client_id: clientId ?? undefined,
        date_from: dateFrom,
        date_to: dateTo,
        page: 1,
      }).finally(() => setIsUserFetching(false))
    }, 500)
    return () => window.clearTimeout(t)
  }, [search])

  // Estado/Cobro/Cliente/Fecha son acciones discretas (un clic o una selección), no texto que
  // se esté escribiendo: se disparan de inmediato, sin esperar el debounce de "Buscar".
  const applyFilters = (overrides: {
    status?: string
    paymentStatus?: string
    clientId?: number | null
    dateFrom?: string
    dateTo?: string
  }) => {
    const nextStatus = overrides.status ?? status
    const nextPaymentStatus = overrides.paymentStatus ?? paymentStatus
    const nextClientId = overrides.clientId !== undefined ? overrides.clientId : clientId
    const nextDateFrom = overrides.dateFrom ?? dateFrom
    const nextDateTo = overrides.dateTo ?? dateTo
    setIsUserFetching(true)
    void load({
      search,
      status: nextStatus === 'all' ? undefined : (nextStatus as SaleStatus),
      payment_status: nextPaymentStatus === 'all' ? undefined : (nextPaymentStatus as SalePaymentStatus),
      client_id: nextClientId ?? undefined,
      date_from: nextDateFrom,
      date_to: nextDateTo,
      page: 1,
    }).finally(() => setIsUserFetching(false))
  }

  const handleStatusChange = (value: string) => { setStatus(value); applyFilters({ status: value }) }
  const handlePaymentStatusChange = (value: string) => { setPaymentStatus(value); applyFilters({ paymentStatus: value }) }
  const handleClientIdChange = (value: number | null) => { setClientId(value); applyFilters({ clientId: value }) }
  const handleDateFromChange = (value: string) => { setDateFrom(value); applyFilters({ dateFrom: value }) }
  const handleDateToChange = (value: string) => { setDateTo(value); applyFilters({ dateTo: value }) }

  const table = useReactTable({
    data: items,
    columns: salesColumns,
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

  const resetFilters = () => {
    appliedSearch.current = ''
    setSearch('')
    setStatus('all')
    setPaymentStatus('all')
    setClientId(null)
    setDateFrom('')
    setDateTo('')
    setIsUserFetching(true)
    void load({
      search: '',
      status: undefined,
      payment_status: undefined,
      client_id: undefined,
      date_from: '',
      date_to: '',
      page: 1,
    }).finally(() => setIsUserFetching(false))
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
        <p className="text-muted-foreground text-sm">Cargando ventas...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
        <p className="text-sm font-semibold">Error al cargar ventas</p>
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
      <TableLoadingBar active={isUserFetching} />

      <div className="flex items-end justify-between gap-2">
        <div className="flex flex-1 flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">Buscar</span>
            <Input
              placeholder="Código o cliente..."
              value={search}
              disabled={isFetching}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-full sm:w-[200px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">Estado</span>
            <Select value={status} disabled={isFetching} onValueChange={handleStatusChange}>
              <SelectTrigger className="h-8 w-full sm:w-[140px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {SALE_STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">Cobro</span>
            <Select value={paymentStatus} disabled={isFetching} onValueChange={handlePaymentStatusChange}>
              <SelectTrigger className="h-8 w-full sm:w-[140px]">
                <SelectValue placeholder="Cobro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los cobros</SelectItem>
                {SALE_PAYMENT_STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">Cliente</span>
            <div className="w-full sm:w-[200px]">
              <ClientSelect
                value={clientId}
                onValueChange={handleClientIdChange}
                showAll
                disabled={isFetching}
                placeholder="Todos"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">Fecha desde</span>
            <Input
              type="date"
              value={dateFrom}
              disabled={isFetching}
              onChange={(e) => handleDateFromChange(e.target.value)}
              className="h-8 w-full sm:w-[145px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">Fecha hasta</span>
            <Input
              type="date"
              value={dateTo}
              disabled={isFetching}
              onChange={(e) => handleDateToChange(e.target.value)}
              className="h-8 w-full sm:w-[145px]"
            />
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
                    className={cn('bg-muted/50 text-xs', (h.column.columnDef.meta as any)?.className)}
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
                <TableCell colSpan={salesColumns.length} className="text-muted-foreground h-20 text-center text-sm">
                  No hay ventas para mostrar.
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
        onDelete={handleBulkDelete}
        onClear={() => table.resetRowSelection()}
      />
    </div>
  )
}
