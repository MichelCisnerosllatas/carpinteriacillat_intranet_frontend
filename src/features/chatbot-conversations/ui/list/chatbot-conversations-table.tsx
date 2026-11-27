'use client'

// Conversaciones del chatbot: lo que los clientes escribieron (o dijeron por voz) en el sitio.

import { useEffect, useMemo, useRef, useState } from 'react'
import { flexRender, getCoreRowModel, useReactTable, type PaginationState } from '@tanstack/react-table'
import { cn } from '@/shared/lib/utils'
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
import { chatbotOptionsService } from '@/features/chatbot-options/services/chatbot-options.service'
import { useChatbotConversationListStore } from '../../stores/useChatbotConversationListStore'
import { useChatbotConversationStatusStore } from '../../stores/useChatbotConversationStatusStore'
import { useChatbotConversationDeleteStore } from '../../stores/useChatbotConversationDeleteStore'
import { CHATBOT_CONVERSATION_STATUSES, getChatbotConversationStatus } from '../../data/data'
import type { ChatbotConversationStatus } from '../../model/chatbotconversationget.dto'
import { chatbotConversationsColumns } from './chatbot-conversations-columns'
import { useCan } from '@/features/auth/hooks/usePermission'

export function ChatbotConversationsTable() {
  const { items, meta, filters, hasLoaded, isInitialLoading, isFetching, isError, message, load, reset } = useChatbotConversationListStore()
  const { bulkUpdateStatus } = useChatbotConversationStatusStore()
  const { bulkDeleteItems } = useChatbotConversationDeleteStore()

  const [search, setSearch] = useState(filters.search ?? '')
  const [status, setStatus] = useState<string>(filters.status ?? 'all')
  const [optionId, setOptionId] = useState<string>(filters.id_chatbot_option !== undefined ? String(filters.id_chatbot_option) : 'all')
  const [options, setOptions] = useState<{ id: number; title: string }[]>([])
  const [isUserFetching, setIsUserFetching] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const appliedSearch = useRef(search)

  const pagination = useMemo<PaginationState>(() => ({
    pageIndex: Math.max((filters.page ?? 1) - 1, 0),
    pageSize: filters.per_page ?? 20,
  }), [filters.page, filters.per_page])

  useEffect(() => { void load() }, [])

  // Opciones para el filtro "Opción" (incluye inactivas: hay conversaciones viejas que las usaron).
  useEffect(() => {
    let cancelled = false
    chatbotOptionsService.getList({ page: 1, per_page: 100 })
      .then((res) => { if (!cancelled && res.success) setOptions(res.data.map((o) => ({ id: o.id_chatbot_option, title: o.title }))) })
      .catch(() => { /* el filtro queda vacío, no bloquea la lista */ })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (appliedSearch.current === search) return
    appliedSearch.current = search
    const t = window.setTimeout(() => {
      setIsUserFetching(true)
      void load({ search, page: 1 }).finally(() => setIsUserFetching(false))
    }, 500)
    return () => window.clearTimeout(t)
  }, [search])

  const applyFilter = (params: Parameters<typeof load>[0]) => {
    setIsUserFetching(true)
    void load({ ...params, page: 1 }).finally(() => setIsUserFetching(false))
  }

  const handleStatusChange = (value: string) => {
    setStatus(value)
    applyFilter({ status: value === 'all' ? undefined : (value as ChatbotConversationStatus) })
  }

  const handleOptionChange = (value: string) => {
    setOptionId(value)
    applyFilter({ id_chatbot_option: value === 'all' ? undefined : Number(value) })
  }

  const resetFilters = () => {
    appliedSearch.current = ''
    setSearch(''); setStatus('all'); setOptionId('all')
    applyFilter({ search: '', status: undefined, id_chatbot_option: undefined, id_chatbot_visitor: undefined })
  }

  // Vuelve a pedir la lista con los filtros y la página actuales
  const handleRefresh = () => {
    setIsUserFetching(true)
    void load().finally(() => setIsUserFetching(false))
  }

  const hasActiveFilters = search !== '' || status !== 'all' || optionId !== 'all' || filters.id_chatbot_visitor !== undefined

  // Acciones masivas según permisos (ver ROLES_Y_PERMISOS.md)
  const canState = useCan('chatbot_conversations.state')
  const canDelete = useCan('chatbot_conversations.delete')
  const canBulk = canState || canDelete
  // Sin acciones masivas permitidas no mostramos la columna de selección
  const columns = useMemo(
    () => (canBulk ? chatbotConversationsColumns : chatbotConversationsColumns.filter((c) => c.id !== 'select')),
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

  const handleBulkStatus = async (value: string) => {
    const label = getChatbotConversationStatus(value).label
    await swalConfirmAction({
      title: `¿Marcar ${selectedCount} conversación(es) como "${label}"?`,
      text: value === 'closed' ? 'Los clientes ya no podrán seguir escribiendo en ellas.' : undefined,
      confirmText: 'Sí, continuar',
      cancelText: 'Cancelar',
      loading: { title: 'Actualizando...' },
      action: async ({ close, showError }) => {
        const ok = await bulkUpdateStatus(selectedIds, value as ChatbotConversationStatus)
        if (ok) {
          toastSuccess('Estado actualizado', `${selectedCount} conversación(es) ahora están "${label}".`)
          table.resetRowSelection()
          close()
        } else {
          showError(useChatbotConversationStatusStore.getState().error ?? 'No se pudieron actualizar todas.')
        }
      },
    })
  }

  const handleBulkDelete = async () => {
    await swalDeleteConfirm(
      `¿Eliminar ${selectedCount} conversación(es)?`, 'Se borran con todos sus mensajes. Esta acción no se puede deshacer.',
      async ({ close, showError }) => {
        const ok = await bulkDeleteItems(selectedIds)
        if (ok) {
          toastSuccess('Conversaciones eliminadas', `${selectedCount} conversación(es) eliminada(s).`)
          table.resetRowSelection()
          close()
        } else {
          showError(useChatbotConversationDeleteStore.getState().error ?? 'No se pudieron eliminar todas.')
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
        title="Error al cargar las conversaciones"
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
          <Input placeholder="Nombre, teléfono, correo o mensaje..." value={search} disabled={isFetching} onChange={(e) => setSearch(e.target.value)} className="h-8 w-full sm:w-[280px]" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Estado</span>
          <Select value={status} disabled={isFetching} onValueChange={handleStatusChange}>
            <SelectTrigger className="h-8 w-full sm:w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {CHATBOT_CONVERSATION_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Opción</span>
          <Select value={optionId} disabled={isFetching} onValueChange={handleOptionChange}>
            <SelectTrigger className="h-8 w-full sm:w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {options.map((o) => <SelectItem key={o.id} value={String(o.id)}>{o.title}</SelectItem>)}
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
                <TableRow key={row.id} className={cn(row.original.status === 'open' && 'bg-amber-50/40 dark:bg-amber-950/10')}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cn('py-2', (cell.column.columnDef.meta as any)?.className)}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={chatbotConversationsColumns.length} className="h-20 text-center text-sm text-muted-foreground">
                  Todavía no hay conversaciones. Aparecerán aquí cuando un cliente use el chatbot del sitio.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} className="mt-auto"
        summary={meta ? `Mostrando ${meta.from ?? 0} - ${meta.to ?? 0} de ${meta.total ?? 0} conversaciones` : 'Sin registros'}
      />

      <DataTableBulkActions
        selectedCount={selectedCount}
        statusActions={CHATBOT_CONVERSATION_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
        onChangeStatus={canState ? handleBulkStatus : undefined}
        onDelete={canDelete ? handleBulkDelete : undefined}
        onClear={() => table.resetRowSelection()}
      />
    </div>
  )
}
