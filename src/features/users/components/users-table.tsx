'use client'

import { useState } from 'react'
import {
  type ColumnFiltersState, type PaginationState, type SortingState, type VisibilityState,
  flexRender, getCoreRowModel, getFacetedRowModel, getFacetedUniqueValues,
  getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/shared/lib/utils'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { DataTableToolbar } from '@/shared/ui/data-table/toolbar'
import { DataTablePagination } from '@/shared/ui/data-table/pagination'
import { roles } from '../data/data'
import type { User } from '../data/schema'
import { usersColumns } from './users-columns'

export function UsersTable({ data }: { data: User[] }) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  const table = useReactTable({
    data,
    columns: usersColumns,
    state: { sorting, pagination, rowSelection, columnFilters, columnVisibility },
    enableRowSelection: true,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return (
    <div className="flex flex-1 flex-col gap-4">
      <DataTableToolbar
        table={table}
        searchPlaceholder="Filter users..."
        searchKey="username"
        filters={[
          {
            columnId: 'status',
            title: 'Status',
            options: [
              { label: 'Active',    value: 'active' },
              { label: 'Inactive',  value: 'inactive' },
              { label: 'Invited',   value: 'invited' },
              { label: 'Suspended', value: 'suspended' },
            ],
          },
          {
            columnId: 'role',
            title: 'Role',
            options: roles.map((r) => ({ ...r })),
          },
        ]}
      />
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
                      'bg-background group-hover/row:bg-muted',
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
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className="group/row">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className="mt-auto" />
    </div>
  )
}
