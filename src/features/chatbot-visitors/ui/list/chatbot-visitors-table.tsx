'use client'

// Visitantes del chatbot: quién usó el chat (anónimos o con datos de contacto).

import { useEffect, useMemo, useRef, useState } from 'react'
import { flexRender, getCoreRowModel, useReactTable, type PaginationState } from '@tanstack/react-table'
import { cn } from '@/shared/lib/utils'
import { Input } from '@/shared/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { DataTablePagination } from '@/shared/ui/data-table/pagination'
import { DataTableBulkActions } from '@/shared/ui/data-table/bulk-actions'
import { TableLoadingBar } from '@/shared/ui/data-table/table-loading-bar'
import { DataTableFilterActions } from '@/shared/ui/data-table/filter-actions'
import { swalDeleteConfirm } from '@/shared/lib/swal'
import { toastSuccess } from '@/shared/lib/toast'
import { ErrorState } from '@/widgets/error/error-state'
import { CircleProgressIndicatorPage } from '@/widgets/CircleProgressIndicatorPage'
import { useChatbotVisitorListStore } from '../../stores/useChatbotVisitorListStore'
import { useChatbotVisitorDeleteStore } from '../../stores/useChatbotVisitorDeleteStore'
import { chatbotVisitorsColumns } from './chatbot-visitors-columns'
import { useCan } from '@/features/auth/hooks/usePermission'

export function ChatbotVisitorsTable() {
  const { items, meta, filters, hasLoaded, isInitialLoading, isFetching, isError, message, load, reset } = useChatbotVisitorListStore()
  const { bulkDeleteItems } = useChatbotVisitorDeleteStore()

  const [search, setSearch] = useState(filters.search ?? '')
  const [isUserFetching, setIsUserFetching] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
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

  const resetFilters = () => {
    appliedSearch.current = ''
    setSearch('')
    setIsUserFetching(true)
    void load({ search: '', page: 1 }).finally(() => setIsUserFetching(false))
  }

  // Vuelve a pedir la lista con los filtros y la página actuales
  const handleRefresh = () => {
    setIsUserFetching(true)
    void load().finally(() => setIsUserFetching(false))
  }

  const hasActiveFilters = search !== ''

  // Acciones masivas según permisos (ver ROLES_Y_PERMISOS.md)
  const canDelete = useCan('chatbot_visitors.delete')
  const canBulk = canDelete
  // Sin acciones masivas permitidas no mostramos la columna de selección
  const columns = useMemo(
    () => (canBulk ? chatbotVisitorsColumns : chatbotVisitorsColumns.filter((c) => c.id !== 'select')),
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

  const handleBulkDelete = async () => {
    await swalDeleteConfirm(
      `¿Eliminar ${selectedCount} visitante(s)?`, 'Se borran también todas sus conversaciones. Esta acción no se puede deshacer.',
      async ({ close, showError }) => {
        const ok = await bulkDeleteItems(selectedIds)
        if (ok) {
          toastSuccess('Visitantes eliminados', `${selectedCount} visitante(s) eliminado(s).`)
          table.resetRowSelection()
          close()
        } else {
          showError(useChatbotVisitorDeleteStore.getState().error ?? 'No se pudieron eliminar todos.')
        }
      },
      { title: 'Eliminando...' }
    )
  }

  if (!hasLoaded && !isInitialLoading) return <CircleProgressIndicatorPage />

  if (isError) {
    return (
      <ErrorState
        isPrimaryLoading={isFetching}
        title="Error al cargar los visitantes"
        message={message?.toString()}
        primaryLabel="Reintentar"
        onPrimaryAction={() => { reset(); void load() }}
      />
    )
  }

  return (
    <div className="relative flex flex-1 flex-col gap-4">
      <TableLoadingBar active={isUserFetching} />

      <div className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Buscar</span>
          <Input placeholder="Nombre, teléfono, correo o IP..." value={search} disabled={isFetching} onChange={(e) => setSearch(e.target.value)} className="h-8 w-full sm:w-[280px]" />
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
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cn('py-2', (cell.column.columnDef.meta as any)?.className)}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={chatbotVisitorsColumns.length} className="h-20 text-center text-sm text-muted-foreground">
                  Todavía no hay visitantes. Aparecerán aquí cuando un cliente use el chatbot del sitio.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} className="mt-auto"
        summary={meta ? `Mostrando ${meta.from ?? 0} - ${meta.to ?? 0} de ${meta.total ?? 0} visitantes` : 'Sin registros'}
      />

      <DataTableBulkActions
        selectedCount={selectedCount}
        onDelete={canDelete ? handleBulkDelete : undefined}
        onClear={() => table.resetRowSelection()}
      />
    </div>
  )
}
