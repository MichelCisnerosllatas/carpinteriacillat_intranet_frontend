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
import { DataTableBulkActions } from '@/shared/ui/data-table/bulk-actions'
import { TableLoadingBar } from '@/shared/ui/data-table/table-loading-bar'
import { ENTITY_STATES } from '@/shared/config/entity-states'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { swalDeleteConfirm } from '@/shared/lib/swal'
import { useSectionItemDetailListStore } from '../../stores/useSectionItemDetailListStore'
import { useSectionItemDetailDeleteStore } from '../../stores/useSectionItemDetailDeleteStore'
import { sectionItemDetailsColumns, sectionItemDetailsScopedColumns } from './section-item-details-columns'
import { ErrorState } from '@/widgets/error/error-state'
import { CircleProgressIndicatorPage } from '@/widgets/CircleProgressIndicatorPage'

/**
 * `idSectionItem` es opcional: sin él, la tabla carga todos los detalles (uso standalone en
 * `/section-item-details`); con él, filtra por ese item de sección y oculta la columna "Item" —
 * se usa embebida en un tab del detalle de `SectionItem`.
 */
export function SectionItemDetailsTable({ idSectionItem }: { idSectionItem?: number }) {
  const {
    items, meta, filters, hasLoaded, isInitialLoading, isFetching, isError, message,
    load, reset,
  } = useSectionItemDetailListStore()
  const { bulkToggleState, bulkDeleteItems } = useSectionItemDetailDeleteStore()

  const columns = idSectionItem !== undefined ? sectionItemDetailsScopedColumns : sectionItemDetailsColumns

  const [rowSelection, setRowSelection]         = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting]                   = useState<SortingState>([])
  const [search, setSearch]                     = useState(filters.search ?? '')
  const [state, setState]                       = useState<string>(filters.state !== undefined ? String(filters.state) : 'all')
  const [isBulkLoading, setIsBulkLoading]       = useState(false)
  /** true solo mientras hay un fetch disparado por el usuario (filtro/búsqueda/paginación) — no en la carga automática al entrar al módulo. Controla la TableLoadingBar. */
  const [isUserFetching, setIsUserFetching]     = useState(false)

  const pagination = useMemo<PaginationState>(() => ({
    pageIndex: Math.max((filters.page ?? 1) - 1, 0),
    pageSize: filters.per_page ?? 10,
  }), [filters.page, filters.per_page])

  const appliedSearch = useRef(search)

  useEffect(() => { void load({ id_section_item: idSectionItem }) }, [idSectionItem])

  // "Buscar" es texto libre: se espera a que el usuario deje de escribir (debounce) antes de
  // disparar la petición y encender la barra, para no parpadear en cada tecla.
  useEffect(() => {
    if (appliedSearch.current === search) return
    appliedSearch.current = search

    const t = window.setTimeout(() => {
      setIsUserFetching(true)
      void load({ id_section_item: idSectionItem, search, state: state === 'all' ? undefined : Number(state), page: 1 }).finally(() => setIsUserFetching(false))
    }, 500)
    return () => window.clearTimeout(t)
  }, [search])

  // Estado es una acción discreta (una selección), no texto que se esté escribiendo: se
  // dispara de inmediato, sin esperar el debounce de "Buscar".
  const handleStateChange = (value: string) => {
    setState(value)
    setIsUserFetching(true)
    void load({ id_section_item: idSectionItem, search, state: value === 'all' ? undefined : Number(value), page: 1 }).finally(() => setIsUserFetching(false))
  }

  const table = useReactTable({
    data: items,
    columns,
    pageCount: meta?.last_page ?? 1,
    manualPagination: true,
    state: { sorting, pagination, rowSelection, columnVisibility },
    enableRowSelection: true,
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater
      setIsUserFetching(true)
      void load({ id_section_item: idSectionItem, page: next.pageIndex + 1, per_page: next.pageSize }).finally(() => setIsUserFetching(false))
    },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const selectedRows  = table.getFilteredSelectedRowModel().rows
  const selectedCount = selectedRows.length

  const resetFilters = () => {
    appliedSearch.current = ''
    setSearch(''); setState('all')
    setIsUserFetching(true)
    void load({ id_section_item: idSectionItem, search: '', state: undefined, page: 1 }).finally(() => setIsUserFetching(false))
  }

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

  if (!hasLoaded && !isInitialLoading) {
    return (
      <CircleProgressIndicatorPage/>
    )
  }

  if (isError) {
    return (
      <ErrorState
        isPrimaryLoading={isFetching}
        title='Error al cargar registros'
        message={message?.toString()}
        primaryLabel="Reintentar"
        onPrimaryAction={() => {
          reset();
          void load({ id_section_item: idSectionItem })
        }}
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
            <Input placeholder="Título o descripción..." value={search} disabled={isFetching} onChange={(e) => setSearch(e.target.value)} className="h-8 w-full sm:w-[220px]" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Estado</span>
            <Select value={state} disabled={isFetching} onValueChange={handleStateChange}>
              <SelectTrigger className="h-8 w-full sm:w-[155px]"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {ENTITY_STATES.map((s) => <SelectItem key={s.value} value={String(s.value)}>{s.label}</SelectItem>)}
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
                <TableCell colSpan={columns.length} className="h-20 text-center text-sm text-muted-foreground">
                  No hay registros para mostrar.
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
        onActivate={handleBulkActivate}
        onDeactivate={handleBulkDeactivate}
        onDelete={handleBulkDelete}
        onClear={() => table.resetRowSelection()}
      />
    </div>
  )
}
