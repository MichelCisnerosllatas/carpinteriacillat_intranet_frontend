'use client'

// Pantalla principal de "Alertas del sitio": filtros, avisos, tabla con paginación y barra de
// acciones para varias alertas seleccionadas (Activar · Desactivar · Eliminar).

import { useEffect, useMemo, useRef, useState } from 'react'
import { flexRender, getCoreRowModel, useReactTable, type PaginationState } from '@tanstack/react-table'
import { Info, TriangleAlert } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { DataTablePagination } from '@/shared/ui/data-table/pagination'
import { DataTableBulkActions } from '@/shared/ui/data-table/bulk-actions'
import { TableLoadingBar } from '@/shared/ui/data-table/table-loading-bar'
import { swalConfirmAction, swalDeleteConfirm } from '@/shared/lib/swal'
import { toastSuccess } from '@/shared/lib/toast'
import { ErrorState } from '@/widgets/error/error-state'
import { CircleProgressIndicatorPage } from '@/widgets/CircleProgressIndicatorPage'
import { useWebAlertListStore } from '../../stores/useWebAlertListStore'
import { useWebAlertDeleteStore } from '../../stores/useWebAlertDeleteStore'
import { ALERT_STATES, MAX_ALERTS_ON_WEB } from '../../data/data'
import { webAlertsColumns } from './web-alerts-columns'

export function WebAlertsTable() {
  const { items, meta, filters, hasLoaded, isInitialLoading, isFetching, isError, message, load, reset } = useWebAlertListStore()

  const [search, setSearch] = useState(filters.search ?? '')
  const [state, setState]   = useState<string>(filters.state !== undefined ? String(filters.state) : 'all')
  /** true mientras se pide la lista por una acción del usuario (muestra la barrita de carga). */
  const [isUserFetching, setIsUserFetching] = useState(false)
  /** Filas marcadas con la casilla: { "<índice de fila>": true }. */
  const [rowSelection, setRowSelection] = useState({})
  const { bulkToggleState, bulkDeleteItems } = useWebAlertDeleteStore()
  const appliedSearch = useRef(search)

  const pagination = useMemo<PaginationState>(() => ({
    pageIndex: Math.max((filters.page ?? 1) - 1, 0),
    pageSize: filters.per_page ?? 20,
  }), [filters.page, filters.per_page])

  // Al entrar a la pantalla se pide la lista
  useEffect(() => { void load() }, [])

  // La búsqueda espera medio segundo después de dejar de escribir
  useEffect(() => {
    if (appliedSearch.current === search) return
    appliedSearch.current = search
    const t = window.setTimeout(() => {
      setIsUserFetching(true)
      void load({ search, page: 1 }).finally(() => setIsUserFetching(false))
    }, 500)
    return () => window.clearTimeout(t)
  }, [search])

  const handleStateChange = (value: string) => {
    setState(value)
    setIsUserFetching(true)
    void load({ state: value === 'all' ? undefined : Number(value), page: 1 }).finally(() => setIsUserFetching(false))
  }

  const resetFilters = () => {
    appliedSearch.current = ''
    setSearch(''); setState('all')
    setIsUserFetching(true)
    void load({ search: '', state: undefined, page: 1 }).finally(() => setIsUserFetching(false))
  }

  const table = useReactTable({
    data: items,
    columns: webAlertsColumns,
    pageCount: meta?.last_page ?? 1,
    manualPagination: true,
    state: { pagination, rowSelection },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater
      // Al cambiar de página se limpia la selección (las filas marcadas ya no se verían)
      setRowSelection({})
      setIsUserFetching(true)
      void load({ page: next.pageIndex + 1, per_page: next.pageSize }).finally(() => setIsUserFetching(false))
    },
    getCoreRowModel: getCoreRowModel(),
  })

  // ── Acciones para varias alertas seleccionadas ──
  const selectedIds = table.getSelectedRowModel().rows.map((r) => r.original.id)
  const selectedCount = selectedIds.length

  // Activar (1) o desactivar (0) todas las seleccionadas, con confirmación
  const handleBulkToggle = async (newState: number) => {
    const activating = newState === 1
    await swalConfirmAction({
      title: activating ? `¿Activar ${selectedCount} alerta(s)?` : `¿Desactivar ${selectedCount} alerta(s)?`,
      text: activating
        ? 'Se mostrarán en la web (cada una dentro de sus fechas).'
        : 'Dejarán de mostrarse en la web.',
      confirmText: activating ? 'Sí, activar' : 'Sí, desactivar',
      cancelText: 'Cancelar',
      loading: { title: activating ? 'Activando...' : 'Desactivando...' },
      action: async ({ close, showError }) => {
        const ok = await bulkToggleState(selectedIds, newState)
        if (ok) {
          toastSuccess(activating ? 'Alertas activadas' : 'Alertas desactivadas', `${selectedCount} alerta(s).`)
          table.resetRowSelection()
          close()
        } else {
          showError(useWebAlertDeleteStore.getState().error ?? 'No se pudieron actualizar todas las alertas.')
        }
      },
    })
  }

  // Eliminar todas las seleccionadas, con confirmación
  const handleBulkDelete = async () => {
    await swalDeleteConfirm(
      `¿Eliminar ${selectedCount} alerta(s)?`, 'Se borran y dejan de verse en la web. Esta acción no se puede deshacer.',
      async ({ close, showError }) => {
        const ok = await bulkDeleteItems(selectedIds)
        if (ok) {
          toastSuccess('Alertas eliminadas', `${selectedCount} alerta(s) eliminada(s).`)
          table.resetRowSelection()
          close()
        } else {
          showError(useWebAlertDeleteStore.getState().error ?? 'No se pudieron eliminar todas las alertas.')
        }
      },
      { title: 'Eliminando...' }
    )
  }

  // Cuántas alertas se están mostrando ahora en la web (de las que se ven en esta página de la tabla)
  const showingCount = items.filter((a) => a.visibilityStatus === 'showing').length
  // ¿Todas las alertas de la lista están desactivadas? (pasa justo después de instalar: vienen así)
  const noneActive = items.length > 0 && items.every((a) => a.stateValue === 0)

  if (!hasLoaded && !isInitialLoading) return <CircleProgressIndicatorPage />

  if (isError) {
    return (
      <ErrorState
        isPrimaryLoading={isFetching}
        title="Error al cargar las alertas"
        message={message?.toString()}
        primaryLabel="Reintentar"
        onPrimaryAction={() => { reset(); void load() }}
      />
    )
  }

  return (
    <div className="relative flex flex-1 flex-col gap-4">
      <TableLoadingBar active={isUserFetching} />

      {/* La web muestra como máximo MAX_ALERTS_ON_WEB a la vez (las primeras según el orden) */}
      {showingCount > MAX_ALERTS_ON_WEB && (
        <Alert className="border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <TriangleAlert />
          <AlertTitle>Muchas alertas a la vez</AlertTitle>
          <AlertDescription className="text-amber-900/90 dark:text-amber-200/90">
            Hay {showingCount} alertas activas: la web solo muestra las {MAX_ALERTS_ON_WEB} primeras según el orden
            (botón «Ordenar»). Las demás aparecen cuando alguna se desactive o venza.
          </AlertDescription>
        </Alert>
      )}

      {noneActive && (
        <Alert>
          <Info />
          <AlertTitle>Ninguna alerta está activada</AlertTitle>
          <AlertDescription>
            Por ahora la web no muestra ningún aviso. Usa el interruptor «Activada» de una fila para mostrarla.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Buscar</span>
          <Input placeholder="Título o subtítulo..." value={search} disabled={isFetching} onChange={(e) => setSearch(e.target.value)} className="h-8 w-full sm:w-[240px]" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Activada</span>
          <Select value={state} disabled={isFetching} onValueChange={handleStateChange}>
            <SelectTrigger className="h-8 w-full sm:w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {ALERT_STATES.map((s) => <SelectItem key={s.value} value={String(s.value)}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button variant="ghost" size="sm" disabled={isFetching} onClick={resetFilters}>Limpiar</Button>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id} className={cn('bg-muted/50 text-xs', (h.column.columnDef.meta as any)?.className)}>
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className={cn(row.original.stateValue === 0 && 'bg-muted/30')}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cn('py-2', (cell.column.columnDef.meta as any)?.className)}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={webAlertsColumns.length} className="h-20 text-center text-sm text-muted-foreground">
                  No hay alertas. Crea una con «Nueva alerta».
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} className="mt-auto"
        summary={meta ? `Mostrando ${meta.from ?? 0} - ${meta.to ?? 0} de ${meta.total ?? 0} alertas` : 'Sin registros'}
      />

      {/* Barra que aparece al marcar una o más alertas (la misma de los demás módulos) */}
      <DataTableBulkActions
        selectedCount={selectedCount}
        onActivate={() => handleBulkToggle(1)}
        onDeactivate={() => handleBulkToggle(0)}
        onDelete={handleBulkDelete}
        onClear={() => table.resetRowSelection()}
      />
    </div>
  )
}
