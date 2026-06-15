// src/features/users/ui/users-table.tsx
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
import { DataTableBulkActions } from '@/shared/ui/data-table/bulk-actions'
import { ENTITY_STATES } from '@/shared/config/entity-states'
import { swalDeleteConfirm } from '@/shared/lib/swal'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { useUserListStore } from '@/features/users/stores/useUserListStore'
import { useUserDeleteStore } from '../stores/useUserDeleteStore'
import { UsersError } from './users-error'
import { usersColumns } from './users-columns'

export function UsersTable() {
  const { users, meta, filters, hasLoaded, isInitialLoading, isFetching, isError, message, load, reset } = useUserListStore()

  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [search, setSearch] = useState(filters.search ?? '')
  const [isBulkLoading, setIsBulkLoading] = useState(false)

  const [state, setState] = useState<string>(filters.state !== undefined ? String(filters.state) : 'all')
  const [role, setRole] = useState<string>(filters.role !== undefined ? String(filters.role) : 'all')
  const [dateFrom, setDateFrom] = useState(filters.date_from ?? '')
  const [dateTo, setDateTo] = useState(filters.date_to ?? '')

  const pagination = useMemo<PaginationState>(() => ({
    pageIndex: Math.max((filters.page ?? 1) - 1, 0),
    pageSize: filters.per_page ?? 10,
  }), [filters.page, filters.per_page])

  const roleOptions = [
    { label: 'Administrador', value: '1' },
  ]

  const { bulkToggleState, bulkDeleteItems } = useUserDeleteStore()

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
        role: role === 'all' ? undefined : Number(role),
        date_from: dateFrom,
        date_to: dateTo,
        page: 1,
      })
    }, 500)

    return () => window.clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, state, role, dateFrom, dateTo])

  const table = useReactTable({
    data: users,
    columns: usersColumns,
    pageCount: meta?.last_page ?? 1,
    manualPagination: true,
    state: { sorting, pagination, rowSelection, columnVisibility },
    enableRowSelection: true,
    onPaginationChange: (updater) => {
      const nextPagination = typeof updater === 'function' ? updater(pagination) : updater

      void load({
        page: nextPagination.pageIndex + 1,
        per_page: nextPagination.pageSize,
      })
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
    setSearch('')
    setState('all')
    setRole('all')
    setDateFrom('')
    setDateTo('')

    void load({
      search: '',
      state: undefined,
      role: undefined,
      date_from: '',
      date_to: '',
      page: 1,
    })
  }

  const handleBulkActivate = async () => {
    setIsBulkLoading(true)
    try {
      const rows = selectedRows.map((r) => ({ id: r.original.id }))
      const ok = await bulkToggleState(rows, 1)
      if (ok) { toastSuccess('Activados', `${selectedCount} usuario(s) activado(s).`); table.resetRowSelection() }
      else toastError('Error', 'No se pudieron activar todos los usuarios.')
    } finally { setIsBulkLoading(false) }
  }

  const handleBulkDeactivate = async () => {
    setIsBulkLoading(true)
    try {
      const rows = selectedRows.map((r) => ({ id: r.original.id }))
      const ok = await bulkToggleState(rows, 0)
      if (ok) { toastSuccess('Desactivados', `${selectedCount} usuario(s) desactivado(s).`); table.resetRowSelection() }
      else toastError('Error', 'No se pudieron desactivar todos los usuarios.')
    } finally { setIsBulkLoading(false) }
  }

  const handleBulkDelete = async () => {
    const confirmed = await swalDeleteConfirm(`¿Eliminar ${selectedCount} usuario(s)?`, 'Esta acción no se puede deshacer.')
    if (!confirmed) return
    setIsBulkLoading(true)
    try {
      const ids = selectedRows.map((r) => r.original.id)
      const ok = await bulkDeleteItems(ids)
      if (ok) { toastSuccess('Eliminados', `${selectedCount} usuario(s) eliminado(s).`); table.resetRowSelection() }
      else toastError('Error', 'No se pudieron eliminar todos los usuarios.')
    } finally { setIsBulkLoading(false) }
  }

  if (!hasLoaded && !isInitialLoading) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center bg-background">
        <LoaderCircle className="mb-3 size-9 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Cargando usuarios...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <UsersError
        title="Error al cargar usuarios"
        message={message ?? 'No se pudieron cargar los usuarios'}
        isLoading={isFetching}
        showRetryButton={true}
        onRetry={async () => {
          reset();
          await load();
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

      <div className="flex items-end justify-between gap-2">
        <div className="flex flex-1 flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Buscar</span>
            <Input placeholder="Nombre o correo..." value={search} disabled={isFetching} onChange={(e) => setSearch(e.target.value)} className="h-8 w-full sm:w-[220px]" />
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
            <span className="text-xs text-muted-foreground">Rol</span>
            <Select value={role} disabled={isFetching} onValueChange={setRole}>
              <SelectTrigger className="h-8 w-full sm:w-[155px]"><SelectValue placeholder="Rol" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                {roleOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
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
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className={cn('group/row', selectedCount > 0 && !row.getIsSelected() && 'opacity-60')}>
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
                <TableCell colSpan={usersColumns.length} className="h-24 text-center">
                  No hay usuarios para mostrar.
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
