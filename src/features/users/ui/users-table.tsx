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
import { useUserListStore } from '@/features/users/stores/useUserListStore'
import { UsersError } from './users-error'
import { usersColumns } from './users-columns'

export function UsersTable() {
  const { users, meta, filters, hasLoaded, isInitialLoading, isFetching, isError, message, load, reset } = useUserListStore()

  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [search, setSearch] = useState(filters.search ?? '')

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
      // onRetry={() => void load()}
      onRetry={async () => {
        // useUserListStore.setState({ isInitialLoading: true });
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

      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            placeholder="Buscar usuario..."
            value={search}
            disabled={isFetching}
            onChange={(event) => setSearch(event.target.value)}
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

          <Select value={role} disabled={isFetching} onValueChange={setRole}>
            <SelectTrigger className="h-8 w-full sm:w-[170px]">
              <SelectValue placeholder="Rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los roles</SelectItem>

              {roleOptions.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={dateFrom}
            disabled={isFetching}
            onChange={(event) => setDateFrom(event.target.value)}
            className="h-8 w-full sm:w-[155px]"
          />

          <Input
            type="date"
            value={dateTo}
            disabled={isFetching}
            onChange={(event) => setDateTo(event.target.value)}
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
                    // className={cn(
                    //   'bg-background group-hover/row:bg-muted',
                    //   (header.column.columnDef.meta as { className?: string })?.className
                    // )}
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
                      // className={cn(
                      //   'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                      //   (cell.column.columnDef.meta as { className?: string })?.className
                      // )}
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

      {/*<div className="flex items-center justify-between text-sm text-muted-foreground">*/}
      {/*  <span>*/}
      {/*    {meta ? `Mostrando ${meta.from ?? 0} - ${meta.to ?? 0} de ${meta.total ?? 0} registros` : 'Sin registros'}*/}
      {/*  </span>*/}
      {/*</div>*/}

      {/*<DataTablePagination table={table} className="mt-auto" />*/}
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


// 'use client'
//
// import { useState } from 'react'
// import {
//   type ColumnFiltersState, type PaginationState, type SortingState, type VisibilityState,
//   flexRender, getCoreRowModel, getFacetedRowModel, getFacetedUniqueValues,
//   getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable,
// } from '@tanstack/react-table'
// import { cn } from '@/shared/lib/utils'
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
// import { DataTableToolbar } from '@/shared/ui/data-table/toolbar'
// import { DataTablePagination } from '@/shared/ui/data-table/pagination'
// import { roles } from '../data/data'
// import type { User } from '../data/schema'
// import { usersColumns } from './users-columns'
//
// export function UsersTable({ data }: { data: User[] }) {
//   const [rowSelection, setRowSelection] = useState({})
//   const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
//   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
//   const [sorting, setSorting] = useState<SortingState>([])
//   const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
//
//   const table = useReactTable({
//     data,
//     columns: usersColumns,
//     state: { sorting, pagination, rowSelection, columnFilters, columnVisibility },
//     enableRowSelection: true,
//     onPaginationChange: setPagination,
//     onColumnFiltersChange: setColumnFilters,
//     onRowSelectionChange: setRowSelection,
//     onSortingChange: setSorting,
//     onColumnVisibilityChange: setColumnVisibility,
//     getPaginationRowModel: getPaginationRowModel(),
//     getCoreRowModel: getCoreRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getFacetedRowModel: getFacetedRowModel(),
//     getFacetedUniqueValues: getFacetedUniqueValues(),
//   })
//
//   return (
//     <div className="flex flex-1 flex-col gap-4">
//       <DataTableToolbar
//         table={table}
//         searchPlaceholder="Filter users..."
//         searchKey="username"
//         filters={[
//           {
//             columnId: 'status',
//             title: 'Status',
//             options: [
//               { label: 'Active',    value: 'active' },
//               { label: 'Inactive',  value: 'inactive' },
//               { label: 'Invited',   value: 'invited' },
//               { label: 'Suspended', value: 'suspended' },
//             ],
//           },
//           {
//             columnId: 'role',
//             title: 'Role',
//             options: roles.map((r) => ({ ...r })),
//           },
//         ]}
//       />
//       <div className="overflow-hidden rounded-md border">
//         <Table>
//           <TableHeader>
//             {table.getHeaderGroups().map((hg) => (
//               <TableRow key={hg.id} className="group/row">
//                 {hg.headers.map((h) => (
//                   <TableHead
//                     key={h.id}
//                     colSpan={h.colSpan}
//                     className={cn(
//                       'bg-background group-hover/row:bg-muted',
//                       (h.column.columnDef.meta as { className?: string })?.className
//                     )}
//                   >
//                     {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
//                   </TableHead>
//                 ))}
//               </TableRow>
//             ))}
//           </TableHeader>
//           <TableBody>
//             {table.getRowModel().rows?.length ? (
//               table.getRowModel().rows.map((row) => (
//                 <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className="group/row">
//                   {row.getVisibleCells().map((cell) => (
//                     <TableCell
//                       key={cell.id}
//                       className={cn(
//                         'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
//                         (cell.column.columnDef.meta as { className?: string })?.className
//                       )}
//                     >
//                       {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                     </TableCell>
//                   ))}
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell colSpan={usersColumns.length} className="h-24 text-center">
//                   No results.
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </div>
//       <DataTablePagination table={table} className="mt-auto" />
//     </div>
//   )
// }
