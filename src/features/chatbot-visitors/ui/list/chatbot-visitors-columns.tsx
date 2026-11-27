'use client'

import Link from 'next/link'
import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Checkbox } from '@/shared/ui/checkbox'
import { formatChatDate, visitorDisplayName } from '@/features/chatbot-conversations/data/data'
import { describeUserAgent } from '../../data/data'
import type { ChatbotVisitor } from '../../data/schema'
import { ChatbotVisitorsRowActions } from './chatbot-visitors-row-actions'

export const chatbotVisitorsColumns: ColumnDef<ChatbotVisitor>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        aria-label="Seleccionar todos"
        className="translate-y-0.5"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        aria-label="Seleccionar visitante"
        className="translate-y-0.5"
      />
    ),
    meta: { className: 'w-[40px]', label: 'Seleccionar' },
  },
  {
    id: 'visitor',
    header: () => <span className="text-xs">Visitante</span>,
    cell: ({ row }) => {
      const v = row.original
      return (
        <div className="flex min-w-[180px] flex-col gap-0.5 py-1">
          <Link href={`/chatbot/visitors/${v.id}`} className={cn('text-sm font-medium hover:underline', v.name ? 'text-primary' : 'italic text-muted-foreground')}>
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
    id: 'type',
    header: () => <span className="text-xs">Tipo</span>,
    cell: ({ row }) => {
      const v = row.original
      if (v.userId) return <Badge variant="outline" className="border-sky-300 bg-sky-50 text-xs text-sky-800 dark:bg-sky-950/40 dark:text-sky-200">Usuario registrado</Badge>
      if (v.name || v.phone) return <Badge variant="outline" className="border-teal-300 bg-teal-50 text-xs text-teal-800 dark:bg-teal-950/40 dark:text-teal-200">Con datos</Badge>
      return <Badge variant="outline" className="text-xs text-muted-foreground">Anónimo</Badge>
    },
    meta: { className: 'w-[150px]', label: 'Tipo' },
  },
  {
    id: 'conversations',
    header: () => <span className="text-xs">Conversaciones</span>,
    cell: ({ row }) => <span className="text-sm tabular-nums">{row.original.conversationsCount}</span>,
    meta: { className: 'w-[110px] text-center', label: 'Conversaciones' },
  },
  {
    id: 'device',
    header: () => <span className="text-xs">Dispositivo</span>,
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
        <span>{describeUserAgent(row.original.userAgent)}</span>
        {row.original.ipAddress && <span>{row.original.ipAddress}</span>}
      </div>
    ),
    meta: { className: 'w-[160px]', label: 'Dispositivo' },
  },
  {
    id: 'lastSeen',
    header: () => <span className="text-xs">Última visita</span>,
    cell: ({ row }) => <span className="text-xs">{formatChatDate(row.original.lastSeenAt ?? row.original.createdAt)}</span>,
    meta: { className: 'w-[140px]', label: 'Última visita' },
  },
  {
    id: 'actions',
    cell: ChatbotVisitorsRowActions,
    meta: { className: 'w-[48px]', label: 'Acciones' },
  },
]
