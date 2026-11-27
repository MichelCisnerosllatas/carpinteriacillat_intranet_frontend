'use client'

// Lista de "Opciones de inicio" del chatbot (los ListTile de la primera pantalla del chat).

import { useEffect, useMemo, useRef, useState } from 'react'
import { flexRender, getCoreRowModel, useReactTable, type PaginationState } from '@tanstack/react-table'
import { Info } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { DataTablePagination } from '@/shared/ui/data-table/pagination'
import { DataTableBulkActions } from '@/shared/ui/data-table/bulk-actions'
import { TableLoadingBar } from '@/shared/ui/data-table/table-loading-bar'
import { DataTableFilterActions } from '@/shared/ui/data-table/filter-actions'
import { swalConfirmAction, swalDeleteConfirm } from '@/shared/lib/swal'
import { toastSuccess } from '@/shared/lib/toast'
import { ErrorState } from '@/widgets/error/error-state'
import { CircleProgressIndicatorPage } from '@/widgets/CircleProgressIndicatorPage'
import { useChatbotOptionListStore } from '../../stores/useChatbotOptionListStore'
import { useChatbotOptionDeleteStore } from '../../stores/useChatbotOptionDeleteStore'
import { CHATBOT_OPTION_STATES } from '../../data/data'
import { chatbotOptionsColumns } from './chatbot-options-columns'
import { useCan } from '@/features/auth/hooks/usePermission'

export function ChatbotOptionsTable() {
  const { items, meta, filters, hasLoaded, isInitialLoading, isFetching, isError, message, load, reset } = useChatbotOptionListStore()

  const [search, setSearch] = useState(filters.search ?? '')
  const [state, setState] = useState<string>(filters.state !== undefined ? String(filters.state) : 'all')
  const [isUserFetching, setIsUserFetching] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const { bulkToggleState, bulkDeleteItems } = useChatbotOptionDeleteStore()
  const appliedSearch = useRef(search)

  const pagination = useMemo<PaginationState>(() => ({
    pageIndex: Math.max((filters.page ?? 1) - 1, 0),
    pageSize: filters.per_page ?? 20,
  }), [filters.page, filters.per_page])

  useEffect(() => { void load() }, [])

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

  // Vuelve a pedir la lista con los filtros y la página actuales
  const handleRefresh = () => {
    setIsUserFetching(true)
    void load().finally(() => setIsUserFetching(false))
  }

  const hasActiveFilters = search !== '' || state !== 'all'

  // Acciones masivas según permisos (ver ROLES_Y_PERMISOS.md)
  const canState = useCan('chatbot_options.state')
  const canDelete = useCan('chatbot_options.delete')
  const canBulk = canState || canDelete
  // Sin acciones masivas permitidas no mostramos la columna de selección
  const columns = useMemo(
    () => (canBulk ? chatbotOptionsColumns : chatbotOptionsColumns.filter((c) => c.id !== 'select')),
    [canBulk],
  )

  const table = useReactTable({
    data: items,
    columns,
    pageCount: meta?.last_page ?? 1,
    manualPagination: true,
    state: { pagination, rowSelection },
    enableRowSelection: canBulk,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater
      setRowSelection({})
      setIsUserFetching(true)
      void load({ page: next.pageIndex + 1, per_page: next.pageSize }).finally(() => setIsUserFetching(false))
    },
    getCoreRowModel: getCoreRowModel(),
  })

  const selectedIds = table.getSelectedRowModel().rows.map((r) => r.original.id)
  const selectedCount = selectedIds.length

  const handleBulkToggle = async (on: boolean) => {
    await swalConfirmAction({
      title: on ? `¿Activar ${selectedCount} opción(es)?` : `¿Desactivar ${selectedCount} opción(es)?`,
      text: on ? 'Aparecerán en la pantalla inicial del chatbot.' : 'Dejarán de aparecer en el chatbot.',
      confirmText: on ? 'Sí, activar' : 'Sí, desactivar',
      cancelText: 'Cancelar',
      loading: { title: on ? 'Activando...' : 'Desactivando...' },
      action: async ({ close, showError }) => {
        const ok = await bulkToggleState(selectedIds, on)
        if (ok) {
          toastSuccess(on ? 'Opciones activadas' : 'Opciones desactivadas', `${selectedCount} opción(es).`)
          table.resetRowSelection()
          close()
        } else {
          showError(useChatbotOptionDeleteStore.getState().error ?? 'No se pudieron actualizar todas las opciones.')
        }
      },
    })
  }

  const handleBulkDelete = async () => {
    await swalDeleteConfirm(
      `¿Eliminar ${selectedCount} opción(es)?`, 'Dejan de verse en el chatbot. Las conversaciones que las usaron se conservan.',
      async ({ close, showError }) => {
        const ok = await bulkDeleteItems(selectedIds)
        if (ok) {
          toastSuccess('Opciones eliminadas', `${selectedCount} opción(es) eliminada(s).`)
          table.resetRowSelection()
          close()
        } else {
          showError(useChatbotOptionDeleteStore.getState().error ?? 'No se pudieron eliminar todas las opciones.')
        }
      },
      { title: 'Eliminando...' }
    )
  }

  const activeCount = items.filter((o) => o.state).length

  if (!hasLoaded && !isInitialLoading) return <CircleProgressIndicatorPage />

  if (isError) {
    return (
      <ErrorState
        isPrimaryLoading={isFetching}
        title="Error al cargar las opciones"
        message={message?.toString()}
        primaryLabel="Reintentar"
        onPrimaryAction={() => { reset(); void load() }}
      />
    )
  }

  return (
    <div className="relative flex flex-1 flex-col gap-4">
      <TableLoadingBar active={isUserFetching} />

      {/* Con 1 sola opción activa la web salta la pantalla inicial y abre el chat directo (sin botón volver). */}
      {activeCount <= 1 && items.length > 0 && (
        <Alert>
          <Info />
          <AlertTitle>{activeCount === 0 ? 'Ninguna opción activa' : 'Solo hay una opción activa'}</AlertTitle>
          <AlertDescription>
            {activeCount === 0
              ? 'El chatbot abrirá directamente la conversación con el asistente, sin pantalla inicial.'
              : 'El chatbot abrirá directamente esa opción, sin pantalla inicial ni botón «volver».'}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Buscar</span>
          <Input placeholder="Título, subtítulo o clave..." value={search} disabled={isFetching} onChange={(e) => setSearch(e.target.value)} className="h-8 w-full sm:w-[240px]" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Activa</span>
          <Select value={state} disabled={isFetching} onValueChange={handleStateChange}>
            <SelectTrigger className="h-8 w-full sm:w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {CHATBOT_OPTION_STATES.map((s) => <SelectItem key={s.value} value={String(s.value)}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <DataTableFilterActions
          onClear={resetFilters}
          onRefresh={handleRefresh}
          hasActiveFilters={hasActiveFilters}
          isFetching={isFetching}
        />
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
                <TableRow key={row.id} className={cn(!row.original.state && 'bg-muted/30')}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cn('py-2', (cell.column.columnDef.meta as any)?.className)}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={chatbotOptionsColumns.length} className="h-20 text-center text-sm text-muted-foreground">
                  No hay opciones. Crea una con «Nueva opción».
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} className="mt-auto"
        summary={meta ? `Mostrando ${meta.from ?? 0} - ${meta.to ?? 0} de ${meta.total ?? 0} opciones` : 'Sin registros'}
      />

      <DataTableBulkActions
        selectedCount={selectedCount}
        onActivate={canState ? () => handleBulkToggle(true) : undefined}
        onDeactivate={canState ? () => handleBulkToggle(false) : undefined}
        onDelete={canDelete ? handleBulkDelete : undefined}
        onClear={() => table.resetRowSelection()}
      />
    </div>
  )
}
