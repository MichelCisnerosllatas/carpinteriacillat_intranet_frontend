'use client'

import { useEffect, useMemo, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import {
  type PaginationState, type SortingState, type VisibilityState,
  flexRender, getCoreRowModel, getSortedRowModel, useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { DataTablePagination } from '@/shared/ui/data-table/pagination'
import { DataTableViewOptions } from '@/shared/ui/data-table/view-options'
import { DataTableBulkActions } from '@/shared/ui/data-table/bulk-actions'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { swalDeleteConfirm } from '@/shared/lib/swal'
import { useImageListStore } from '../../stores/useImageListStore'
import { useImageDeleteStore } from '../../stores/useImageDeleteStore'
import { imagesColumns } from './images-columns'

export function ImagesTable() {
  const {
    items, meta, filters, hasLoaded, isInitialLoading, isFetching, isError, message,
    load, reset,
  } = useImageListStore()
  const { bulkDeleteItems } = useImageDeleteStore()

  const [rowSelection, setRowSelection]         = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting]                   = useState<SortingState>([])
  const [isBulkLoading, setIsBulkLoading]       = useState(false)

  const pagination = useMemo<PaginationState>(() => ({
    pageIndex: Math.max((filters.page ?? 1) - 1, 0),
    pageSize: filters.per_page ?? 15,
  }), [filters.page, filters.per_page])

  useEffect(() => { void load() }, [])

  const table = useReactTable({
    data: items,
    columns: imagesColumns,
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

  const selectedRows  = table.getFilteredSelectedRowModel().rows
  const selectedCount = selectedRows.length

  const handleBulkDelete = async () => {
    const confirmed = await swalDeleteConfirm(`¿Eliminar ${selectedCount} imagen(es)?`, 'Esta acción no se puede deshacer.')
    if (!confirmed) return
    setIsBulkLoading(true)
    try {
      const ids = selectedRows.map((r) => r.original.id)
      const ok = await bulkDeleteItems(ids)
      if (ok) { toastSuccess('Eliminadas', `${selectedCount} imagen(es) eliminada(s).`); table.resetRowSelection() }
      else toastError('Error', 'No se pudieron eliminar todas las imágenes.')
    } finally { setIsBulkLoading(false) }
  }

  if (!hasLoaded && !isInitialLoading) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center">
        <LoaderCircle className="mb-3 size-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Cargando imágenes...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
        <p className="text-sm font-semibold">Error al cargar imágenes</p>
        {message && <p className="text-xs text-muted-foreground">{message}</p>}
        <Button size="sm" variant="outline" onClick={() => { reset(); void load() }}>Reintentar</Button>
      </div>
    )
  }

  return (
    <div className="relative flex flex-1 flex-col gap-4">
      {/* Total */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {meta ? `${meta.total ?? 0} imagen(es) en total` : 'Cargando...'}
        </p>
        {isFetching && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <LoaderCircle className="size-3.5 animate-spin" />Actualizando...
          </div>
        )}
        <DataTableViewOptions table={table} />
      </div>

      {/* Tabla */}
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
                <TableCell colSpan={imagesColumns.length} className="h-20 text-center text-sm text-muted-foreground">
                  No hay imágenes para mostrar.
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
