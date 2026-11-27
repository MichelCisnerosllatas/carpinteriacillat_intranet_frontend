'use client'

import { useMemo, useState } from 'react'
import {
  type SortingState,
  flexRender, getCoreRowModel, getSortedRowModel, useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/shared/lib/utils'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { DataTableBulkActions } from '@/shared/ui/data-table/bulk-actions'
import { swalDeleteConfirm } from '@/shared/lib/swal'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { useSectionDeleteStore } from '../../stores/useSectionDeleteStore'
import { sectionsGroupedColumns } from './sections-columns'
import type { Section } from '../../data/schema'
import { useCan } from '@/features/auth/hooks/usePermission'

/**
 * Tabla de un solo grupo de navegación dentro del acordeón de `SectionsTable`. Cada grupo
 * tiene su propia instancia de TanStack Table (selección/orden independientes) para que
 * "seleccionar todos" y las acciones en bloque actúen solo sobre las secciones de ESA
 * navegación, sin mezclarlas con las de otros grupos.
 */
export function SectionsGroupTable({ sections }: { sections: Section[] }) {
  const { bulkToggleState, bulkDeleteItems } = useSectionDeleteStore()

  // Acciones masivas solo si tiene permiso (ver ROLES_Y_PERMISOS.md)
  const canState = useCan('sections.state')
  const canDelete = useCan('sections.delete')
  const canBulk = canState || canDelete

  // Sin acciones masivas no tiene sentido la columna de selección
  const columns = useMemo(
    () => (canBulk ? sectionsGroupedColumns : sectionsGroupedColumns.filter((c) => c.id !== 'select')),
    [canBulk]
  )

  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting]           = useState<SortingState>([{ id: 'order', desc: false }])
  const [isBulkLoading, setIsBulkLoading] = useState(false)

  const table = useReactTable({
    data: sections,
    columns,
    state: { sorting, rowSelection },
    enableRowSelection: canBulk,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const selectedRows  = table.getFilteredSelectedRowModel().rows
  const selectedCount = selectedRows.length

  const handleBulkActivate = async () => {
    setIsBulkLoading(true)
    try {
      const ids = selectedRows.map((r) => r.original.id)
      const ok  = await bulkToggleState(ids, 1)
      if (ok) { toastSuccess('Activados', `${selectedCount} registro(s) activado(s).`); table.resetRowSelection() }
      else toastError('Error', 'No se pudieron activar todos los registros.')
    } finally { setIsBulkLoading(false) }
  }

  const handleBulkDeactivate = async () => {
    setIsBulkLoading(true)
    try {
      const ids = selectedRows.map((r) => r.original.id)
      const ok  = await bulkToggleState(ids, 0)
      if (ok) { toastSuccess('Desactivados', `${selectedCount} registro(s) desactivado(s).`); table.resetRowSelection() }
      else toastError('Error', 'No se pudieron desactivar todos los registros.')
    } finally { setIsBulkLoading(false) }
  }

  const handleBulkDelete = async () => {
    await swalDeleteConfirm(
      `¿Eliminar ${selectedCount} registro(s)?`, 'Esta acción no se puede deshacer.',
      async ({ close, showError }) => {
        const ids = selectedRows.map((r) => r.original.id)
        const ok  = await bulkDeleteItems(ids)
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

  return (
    <div className="flex flex-col gap-3">
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
                <TableCell colSpan={columns.length} className="h-16 text-center text-sm text-muted-foreground">
                  No hay secciones en este grupo.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTableBulkActions
        selectedCount={selectedCount}
        isLoading={isBulkLoading}
        onActivate={canState ? handleBulkActivate : undefined}
        onDeactivate={canState ? handleBulkDeactivate : undefined}
        onDelete={canDelete ? handleBulkDelete : undefined}
        onClear={() => table.resetRowSelection()}
      />
    </div>
  )
}
