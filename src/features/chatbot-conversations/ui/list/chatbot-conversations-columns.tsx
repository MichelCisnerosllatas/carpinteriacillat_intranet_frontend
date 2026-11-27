'use client'

import Link from 'next/link'
import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Checkbox } from '@/shared/ui/checkbox'
import { formatChatDate, getChatbotConversationStatus, visitorDisplayName } from '../../data/data'
import type { ChatbotConversation } from '../../data/schema'
import { ChatbotConversationsRowActions } from './chatbot-conversations-row-actions'

export const chatbotConversationsColumns: ColumnDef<ChatbotConversation>[] = [
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
        aria-label="Seleccionar conversación"
        className="translate-y-0.5"
      />
    ),
    meta: { className: 'w-[40px]', label: 'Seleccionar' },
  },
  {
    id: 'visitor',
    header: () => <span className="text-xs">Visitante</span>,
    cell: ({ row }) => {
      const v = row.original.visitor
      return (
        <div className="flex min-w-[170px] flex-col gap-0.5 py-1">
          <Link href={`/chatbot/conversations/${row.original.id}`} className={cn('text-sm font-medium hover:underline', v.name ? 'text-primary' : 'italic text-muted-foreground')}>
            {visitorDisplayName(v)}
          </Link>
          {v.phone && <span className="text-xs text-muted-foreground">{v.phone}</span>}
          {v.email && <span className="text-xs text-muted-foreground">{v.email}</span>}
        </div>
      )
    },
    meta: { label: 'Visitante' },
  },
  {
    id: 'lastMessage',
    header: () => <span className="text-xs">Último mensaje</span>,
    cell: ({ row }) => (
      <p className="line-clamp-2 max-w-[320px] text-xs text-muted-foreground">{row.original.lastMessage ?? '—'}</p>
    ),
    meta: { label: 'Último mensaje' },
  },
  {
    id: 'option',
    header: () => <span className="text-xs">Opción</span>,
    cell: ({ row }) => row.original.option
      ? <Badge variant="outline" className="text-xs">{row.original.option.title}</Badge>
      : <span className="text-xs text-muted-foreground">—</span>,
    meta: { className: 'w-[160px]', label: 'Opción' },
  },
  {
    id: 'messages',
    header: () => <span className="text-xs">Mensajes</span>,
    cell: ({ row }) => <span className="text-sm tabular-nums">{row.original.messagesCount}</span>,
    meta: { className: 'w-[80px] text-center', label: 'Mensajes' },
  },
  {
    id: 'page',
    header: () => <span className="text-xs">Página</span>,
    cell: ({ row }) => <span className="block max-w-[150px] truncate text-xs text-muted-foreground" title={row.original.pageUrl ?? ''}>{row.original.pageUrl ?? '—'}</span>,
    meta: { className: 'w-[150px]', label: 'Página' },
  },
  {
    id: 'lastMessageAt',
    header: () => <span className="text-xs">Última actividad</span>,
    cell: ({ row }) => <span className="text-xs">{formatChatDate(row.original.lastMessageAt ?? row.original.createdAt)}</span>,
    meta: { className: 'w-[140px]', label: 'Última actividad' },
  },
  {
    id: 'status',
    header: () => <span className="text-xs">Estado</span>,
    cell: ({ row }) => {
      const s = getChatbotConversationStatus(row.original.status)
      return <Badge variant="outline" className={cn('text-xs', s.badge)}>{s.label}</Badge>
    },
    meta: { className: 'w-[100px]', label: 'Estado' },
  },
  {
    id: 'actions',
    cell: ChatbotConversationsRowActions,
    meta: { className: 'w-[48px]', label: 'Acciones' },
  },
]
