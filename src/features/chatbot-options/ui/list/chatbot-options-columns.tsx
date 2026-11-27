'use client'

import Link from 'next/link'
import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/shared/ui/badge'
import { Checkbox } from '@/shared/ui/checkbox'
import { FaIcon } from '@/shared/ui/icon-picker/fa-icon'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { getChatbotOptionAction } from '../../data/data'
import type { ChatbotOption } from '../../data/schema'
import { useChatbotOptionDeleteStore } from '../../stores/useChatbotOptionDeleteStore'
import { ChatbotOptionStateSwitch } from '../chatbot-option-state-switch'
import { ChatbotOptionsRowActions } from './chatbot-options-row-actions'
import { useCan } from '@/features/auth/hooks/usePermission'

function StateCell({ option }: { option: ChatbotOption }) {
  const { loadingId, toggleState } = useChatbotOptionDeleteStore()
  // Sin permiso de cambiar estado el interruptor queda deshabilitado (ver ROLES_Y_PERMISOS.md)
  const canState = useCan('chatbot_options.state')

  const handleChange = async (on: boolean) => {
    const ok = await toggleState(option.id, on)
    if (ok) toastSuccess(on ? 'Opción activada' : 'Opción desactivada', option.title)
    else toastError('Error', useChatbotOptionDeleteStore.getState().error ?? 'No se pudo cambiar el estado.')
  }

  return (
    <ChatbotOptionStateSwitch
      checked={option.state}
      disabled={!canState || loadingId === option.id}
      onCheckedChange={(on) => void handleChange(on)}
    />
  )
}

export const chatbotOptionsColumns: ColumnDef<ChatbotOption>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        aria-label="Seleccionar todas"
        className="translate-y-0.5"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        aria-label="Seleccionar opción"
        className="translate-y-0.5"
      />
    ),
    meta: { className: 'w-[40px]', label: 'Seleccionar' },
  },
  {
    id: 'order',
    header: () => <span className="text-xs">#</span>,
    cell: ({ row }) => <span className="text-xs tabular-nums text-muted-foreground">{row.original.order}</span>,
    meta: { className: 'w-[40px]', label: 'Orden' },
  },
  {
    id: 'state',
    header: () => <span className="text-xs">Activa</span>,
    cell: ({ row }) => <StateCell option={row.original} />,
    meta: { className: 'w-[140px]', label: 'Activa' },
  },
  {
    id: 'option',
    header: () => <span className="text-xs">Opción</span>,
    cell: ({ row }) => (
      <div className="flex min-w-[220px] max-w-[380px] items-center gap-3 py-1">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <FaIcon value={row.original.icon} className="size-4" />
        </span>
        <Link href={`/chatbot/options/edit/${row.original.id}`} className="flex min-w-0 flex-col gap-0.5 hover:underline">
          <span className="truncate text-sm font-medium text-primary">{row.original.title}</span>
          {row.original.subtitle && <span className="line-clamp-1 text-xs text-muted-foreground">{row.original.subtitle}</span>}
        </Link>
      </div>
    ),
    meta: { label: 'Opción' },
  },
  {
    id: 'key',
    header: () => <span className="text-xs">Clave</span>,
    cell: ({ row }) => <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{row.original.key}</code>,
    meta: { className: 'w-[130px]', label: 'Clave' },
  },
  {
    id: 'action',
    header: () => <span className="text-xs">Al tocarla</span>,
    cell: ({ row }) => {
      const action = getChatbotOptionAction(row.original.action)
      const Icon = action.icon
      return (
        <div className="flex flex-col gap-0.5">
          <Badge variant="outline" className="w-fit gap-1 text-xs"><Icon className="size-3" />{action.label}</Badge>
          {row.original.value && <span className="max-w-[200px] truncate text-xs text-muted-foreground">{row.original.value}</span>}
        </div>
      )
    },
    meta: { className: 'w-[200px]', label: 'Al tocarla' },
  },
  {
    id: 'actions',
    cell: ChatbotOptionsRowActions,
    meta: { className: 'w-[48px]', label: 'Acciones' },
  },
]
