'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
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
import { TableLoadingBar } from '@/shared/ui/data-table/table-loading-bar'
import { GOOGLE_ACCESS_REQUEST_STATUSES } from '../../data/data'
import { useGoogleAccessRequestListStore } from '../../stores/useGoogleAccessRequestListStore'
import { googleAccessRequestsColumns } from './google-access-requests-columns'
import { ErrorState } from '@/widgets/error/error-state'
import { CircleProgressIndicatorPage } from '@/widgets/CircleProgressIndicatorPage'

export function GoogleAccessRequestsTable() {
  const { items, meta, filters, hasLoaded, isInitialLoading, isFetching, isError, message, load, reset } =
    useGoogleAccessRequestListStore()

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting]                   = useState<SortingState>([])
  const [search, setSearch]                     = useState(filters.search ?? '')
  const [status, setStatus]                     = useState<string>(filters.status ?? 'pending')
  /** true solo mientras hay un fetch disparado por el usuario (filtro/búsqueda/paginación) — no en la carga automática al entrar al módulo. Controla la TableLoadingBar. */
  const [isUserFetching, setIsUserFetching]     = useState(false)

  const pagination = useMemo<PaginationState>(() => ({
    pageIndex: Math.max((filters.page ?? 1) - 1, 0),
    pageSize: filters.per_page ?? 10,
  }), [filters.page, filters.per_page])

  const appliedSearch = useRef(search)

  // Por defecto solo se ven las pendientes — es lo que de verdad necesita revisión; aprobadas y
  // rechazadas quedan disponibles vía el filtro, no ocultas del todo.
  useEffect(() => { void load({ status: 'pending' }) }, [])

  useEffect(() => {
    if (appliedSearch.current === search) return
    appliedSearch.current = search

    const t = window.setTimeout(() => {
      setIsUserFetching(true)
      void load({ search, status: status === 'all' ? undefined : (status as any), page: 1 }).finally(() => setIsUserFetching(false))
    }, 500)
    return () => window.clearTimeout(t)
  }, [search])

  const handleStatusChange = (value: string) => {
    setStatus(value)
    setIsUserFetching(true)
    void load({ search, status: value === 'all' ? undefined : (value as any), page: 1 }).finally(() => setIsUserFetching(false))
  }

  const table = useReactTable({
    data: items,
    columns: googleAccessRequestsColumns,
    pageCount: meta?.last_page ?? 1,
    manualPagination: true,
    state: { sorting, pagination, columnVisibility },
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater
      setIsUserFetching(true)
      void load({ page: next.pageIndex + 1, per_page: next.pageSize }).finally(() => setIsUserFetching(false))
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const resetFilters = () => {
    appliedSearch.current = ''
    setSearch(''); setStatus('pending')
    setIsUserFetching(true)
    void load({ search: '', status: 'pending', page: 1 }).finally(() => setIsUserFetching(false))
  }

  if (!hasLoaded && !isInitialLoading) {
    return <CircleProgressIndicatorPage />
  }

  if (isError) {
    return (
      <ErrorState
        isPrimaryLoading={isFetching}
        title="Error al cargar solicitudes"
        message={message?.toString()}
        primaryLabel="Reintentar"
        onPrimaryAction={() => { reset(); void load({ status: 'pending' }) }}
      />
    )
  }

  return (
    <div className="relative flex flex-1 flex-col gap-4">
      <TableLoadingBar active={isUserFetching} />

      <div className="flex items-end justify-between gap-2">
        <div className="flex flex-1 flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Buscar</span>
            <Input placeholder="Nombre o correo..." value={search} disabled={isFetching} onChange={(e) => setSearch(e.target.value)} className="h-8 w-full sm:w-[220px]" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Estado</span>
            <Select value={status} disabled={isFetching} onValueChange={handleStatusChange}>
              <SelectTrigger className="h-8 w-full sm:w-[160px]"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {GOOGLE_ACCESS_REQUEST_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
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
                <TableRow key={row.id} className="transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cn('py-2', (cell.column.columnDef.meta as any)?.className)}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={googleAccessRequestsColumns.length} className="h-20 text-center text-sm text-muted-foreground">
                  No hay solicitudes para mostrar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} className="mt-auto"
        summary={meta ? `Mostrando ${meta.from ?? 0} - ${meta.to ?? 0} de ${meta.total ?? 0} registros` : 'Sin registros'}
      />
    </div>
  )
}
