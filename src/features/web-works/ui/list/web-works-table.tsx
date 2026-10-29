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
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { DataTablePagination } from '@/shared/ui/data-table/pagination'
import { DataTableViewOptions } from '@/shared/ui/data-table/view-options'
import { DataTableBulkActions } from '@/shared/ui/data-table/bulk-actions'
import { TableLoadingBar } from '@/shared/ui/data-table/table-loading-bar'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { swalDeleteConfirm } from '@/shared/lib/swal'
import { ErrorState } from '@/widgets/error/error-state'
import { CircleProgressIndicatorPage } from '@/widgets/CircleProgressIndicatorPage'
import { useTypeWorkSelectStore } from '@/features/typeworks'
import { useWebWorkListStore } from '../../stores/useWebWorkListStore'
import { useWebWorkDeleteStore } from '../../stores/useWebWorkDeleteStore'
import { WEB_WORK_STATES } from '../../data/data'
import { webWorksColumns } from './web-works-columns'

/** Pestaña "Todos" (sin filtro de tipo). */
const ALL_TAB = 'all'

/** Pestañas por defecto mientras cargan los tipos reales (o si fallan). */
const FALLBACK_TABS = [
  { key: 'manufacture', label: 'Fabricación' },
  { key: 'restoration', label: 'Restauración' },
]

export function WebWorksTable({ initialTypeKey }: { initialTypeKey?: string }) {
  const { items, meta, filters, hasLoaded, isInitialLoading, isFetching, isError, message, load, reset } =
    useWebWorkListStore()
  const { bulkToggleState, bulkDeleteItems } = useWebWorkDeleteStore()
  const { options: typeOptions, load: loadTypes } = useTypeWorkSelectStore()

  const [rowSelection, setRowSelection]         = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting]                   = useState<SortingState>([])
  const [search, setSearch]                     = useState(filters.search ?? '')
  const [state, setState]                       = useState<string>(filters.state !== undefined ? String(filters.state) : 'all')
  const [typeKey, setTypeKey]                   = useState<string>(initialTypeKey ?? filters.typework_key ?? ALL_TAB)
  const [isBulkLoading, setIsBulkLoading]       = useState(false)
  /** true solo mientras hay un fetch disparado por el usuario (filtro/búsqueda/paginación) — no en la carga automática al entrar al módulo. Controla la TableLoadingBar. */
  const [isUserFetching, setIsUserFetching]     = useState(false)

  // Pestañas = tipos activos reales (etiquetas administrables desde "Tipos de trabajo").
  const tabs = useMemo(
    () => (typeOptions.length > 0
      ? typeOptions.map((t) => ({ key: t.typework_key, label: t.typework_name }))
      : FALLBACK_TABS),
    [typeOptions],
  )

  const pagination = useMemo<PaginationState>(() => ({
    pageIndex: Math.max((filters.page ?? 1) - 1, 0),
    pageSize: filters.per_page ?? 10,
  }), [filters.page, filters.per_page])

  const appliedSearch = useRef(search)

  useEffect(() => {
    void loadTypes()
    void load({ typework_key: typeKey === ALL_TAB ? undefined : typeKey, page: initialTypeKey ? 1 : filters.page })
  }, [])

  const buildParams = (overrides: { state?: string; typeKey?: string } = {}) => {
    const nextState = overrides.state ?? state
    const nextType = overrides.typeKey ?? typeKey
    return {
      search,
      state: nextState === 'all' ? undefined : Number(nextState),
      typework_key: nextType === ALL_TAB ? undefined : nextType,
      page: 1,
    }
  }

  // "Buscar" es texto libre: debounce de 500 ms antes de pedir.
  useEffect(() => {
    if (appliedSearch.current === search) return
    appliedSearch.current = search

    const t = window.setTimeout(() => {
      setIsUserFetching(true)
      void load(buildParams()).finally(() => setIsUserFetching(false))
    }, 500)
    return () => window.clearTimeout(t)
  }, [search])

  // Estado / pestaña de tipo son acciones discretas: se disparan de inmediato.
  const applyFilters = (overrides: { state?: string; typeKey?: string }) => {
    setIsUserFetching(true)
    void load(buildParams(overrides)).finally(() => setIsUserFetching(false))
  }

  const handleStateChange = (value: string) => { setState(value); applyFilters({ state: value }) }
  const handleTypeChange = (value: string) => {
    setTypeKey(value)
    setRowSelection({})
    applyFilters({ typeKey: value })
  }

  const table = useReactTable({
    data: items,
    columns: webWorksColumns,
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
    setSearch(''); setState('all')
    setIsUserFetching(true)
    void load({ search: '', state: undefined, typework_key: typeKey === ALL_TAB ? undefined : typeKey, page: 1 }).finally(() => setIsUserFetching(false))
  }

  const handleBulkActivate = async () => {
    setIsBulkLoading(true)
    const ok = await bulkToggleState(selectedRows.map((r) => r.original.id), 1)
    if (ok) { toastSuccess('Visibles', `${selectedCount} trabajo(s) ahora se muestran en la web.`); table.resetRowSelection() }
    else toastError('Error', useWebWorkDeleteStore.getState().error ?? 'No se pudieron mostrar todos los trabajos.')
    setIsBulkLoading(false)
  }

  const handleBulkDeactivate = async () => {
    setIsBulkLoading(true)
    const ok = await bulkToggleState(selectedRows.map((r) => r.original.id), 0)
    if (ok) { toastSuccess('Ocultos', `${selectedCount} trabajo(s) ocultos de la web.`); table.resetRowSelection() }
    else toastError('Error', useWebWorkDeleteStore.getState().error ?? 'No se pudieron ocultar todos los trabajos.')
    setIsBulkLoading(false)
  }

  const handleBulkDelete = async () => {
    await swalDeleteConfirm(
      `¿Eliminar ${selectedCount} trabajo(s)?`, 'Se borran también sus fotos de galería y pares Antes/Después. Esta acción no se puede deshacer.',
      async ({ close, showError }) => {
        const ok = await bulkDeleteItems(selectedRows.map((r) => r.original.id))
        if (ok) {
          toastSuccess('Eliminados', `${selectedCount} trabajo(s) eliminado(s).`)
          table.resetRowSelection()
          close()
        } else {
          showError(useWebWorkDeleteStore.getState().error ?? 'No se pudieron eliminar todos los trabajos.')
        }
      },
      { title: 'Eliminando...' }
    )
  }

  if (!hasLoaded && !isInitialLoading) {
    return <CircleProgressIndicatorPage />
  }

  if (isError) {
    return (
      <ErrorState
        isPrimaryLoading={isFetching}
        title="Error al cargar trabajos"
        message={message?.toString()}
        primaryLabel="Reintentar"
        onPrimaryAction={() => { reset(); void load() }}
      />
    )
  }

  return (
    <div className="relative flex flex-1 flex-col gap-4">
      <TableLoadingBar active={isUserFetching} />

      <Tabs value={typeKey} onValueChange={handleTypeChange}>
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value={ALL_TAB} disabled={isFetching}>Todos</TabsTrigger>
          {tabs.map((t) => (
            <TabsTrigger key={t.key} value={t.key} disabled={isFetching}>{t.label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-1 flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Buscar</span>
            <Input placeholder="Título, descripción..." value={search} disabled={isFetching} onChange={(e) => setSearch(e.target.value)} className="h-8 w-full sm:w-[240px]" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Estado</span>
            <Select value={state} disabled={isFetching} onValueChange={handleStateChange}>
              <SelectTrigger className="h-8 w-full sm:w-[155px]"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {WEB_WORK_STATES.map((s) => <SelectItem key={s.value} value={String(s.value)}>{s.label}</SelectItem>)}
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
                <TableCell colSpan={webWorksColumns.length} className="h-20 text-center text-sm text-muted-foreground">
                  No hay trabajos para mostrar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} className="mt-auto"
        summary={meta ? `Mostrando ${meta.from ?? 0} - ${meta.to ?? 0} de ${meta.total ?? 0} trabajos` : 'Sin registros'}
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
