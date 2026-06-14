'use client'

import { useEffect, useMemo, useState } from 'react'
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
import { useRoleListStore } from '@/features/roles/stores/useRoleListStore'
import { RolesError } from './roles-error'
import { rolesColumns } from './roles-columns'

export function RolesTable() {
  const { roles, meta, filters, hasLoaded, isInitialLoading, isFetching, isError, message, load, reset } =
    useRoleListStore()

  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [search, setSearch] = useState(filters.search ?? '')
  const [state, setState] = useState<string>(filters.state !== undefined ? String(filters.state) : 'all')
  const [dateFrom, setDateFrom] = useState(filters.date_from ?? '')
  const [dateTo, setDateTo] = useState(filters.date_to ?? '')

  const pagination = useMemo<PaginationState>(() => ({
    pageIndex: Math.max((filters.page ?? 1) - 1, 0),
    pageSize: filters.per_page ?? 10,
  }), [filters.page, filters.per_page])

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!hasLoaded) return

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, state, dateFrom, dateTo])

  const table = useReactTable({
    data: roles,
    columns: rolesColumns,
    pageCount: meta?.last_page ?? 1,
    manualPagination: true,
    state: { sorting, pagination, rowSelection, columnVisibility },
    enableRowSelection: true,
    onPaginationChange: (updater) => {
      const nextPagination = typeof updater === 'function' ? updater(pagination) : updater
      void load({ page: nextPagination.pageIndex + 1, per_page: nextPagination.pageSize })
    },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const resetFilters = () => {
    setSearch('')
    setState('all')
    setDateFrom('')
    setDateTo('')
    void load({ search: '', state: undefined, date_from: '', date_to: '', page: 1 })
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
        onRetry={async () => {
          reset()
          await load()
        }}
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

      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            placeholder="Buscar rol..."
            value={search}
            disabled={isFetching}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-full sm:w-[250px]"
          />

          <Select value={state} disabled={isFetching} onValueChange={setState}>
            <SelectTrigger className="h-8 w-full sm:w-[150px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="1">Activos</SelectItem>
              <SelectItem value="0">Inactivos</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={dateFrom}
            disabled={isFetching}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-8 w-full sm:w-[155px]"
          />

          <Input
            type="date"
            value={dateTo}
            disabled={isFetching}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-8 w-full sm:w-[155px]"
          />

          <Button variant="ghost" size="sm" disabled={isFetching} onClick={resetFilters}>
            Limpiar
          </Button>
        </div>

        <DataTableViewOptions table={table} />
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="group/row">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(
                      'whitespace-nowrap bg-background group-hover/row:bg-muted',
                      (header.column.columnDef.meta as { className?: string })?.className
                    )}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className="group/row">
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
        summary={
          meta
            ? `Mostrando ${meta.from ?? 0} - ${meta.to ?? 0} de ${meta.total ?? 0} registros`
            : 'Sin registros'
        }
      />
    </div>
  )
}
