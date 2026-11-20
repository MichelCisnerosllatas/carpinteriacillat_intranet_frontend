'use client'

import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { CheckCircle2, Eye, Lock, RotateCcw, Trash2, UserRound } from 'lucide-react'
import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { swalConfirmAction, swalDeleteConfirm } from '@/shared/lib/swal'
import { toastSuccess } from '@/shared/lib/toast'
import { useChatbotConversationStatusStore } from '../../stores/useChatbotConversationStatusStore'
import { useChatbotConversationDeleteStore } from '../../stores/useChatbotConversationDeleteStore'
import { CHATBOT_CONVERSATION_STATUSES, getChatbotConversationStatus, visitorDisplayName } from '../../data/data'
import type { ChatbotConversation } from '../../data/schema'
import type { ChatbotConversationStatus } from '../../model/chatbotconversationget.dto'

export const CHATBOT_STATUS_ICONS: Record<ChatbotConversationStatus, React.ReactNode> = {
  open: <RotateCcw size={16} />,
  attended: <CheckCircle2 size={16} />,
  closed: <Lock size={16} />,
}

export function ChatbotConversationsRowActions({ row }: { row: Row<ChatbotConversation> }) {
  const router = useRouter()
  const { updateStatus } = useChatbotConversationStatusStore()
  const { deleteItem } = useChatbotConversationDeleteStore()
  const name = visitorDisplayName(row.original.visitor)

  const go = (url: string) => { NProgress.start(); router.push(url) }

  const handleChangeStatus = async (status: ChatbotConversationStatus) => {
    const label = getChatbotConversationStatus(status).label
    await swalConfirmAction({
      title: `¿Marcar como "${label}"?`,
      text: status === 'closed' ? `${name} ya no podrá seguir escribiendo en esta conversación.` : name,
      confirmText: 'Sí, continuar',
      cancelText: 'Cancelar',
      loading: { title: 'Actualizando...' },
      action: async ({ close, showError }) => {
        const ok = await updateStatus(row.original.id, status)
        if (ok) { toastSuccess('Estado actualizado', `La conversación ahora está "${label}".`); close() }
        else showError(useChatbotConversationStatusStore.getState().error ?? 'No se pudo cambiar el estado.')
      },
    })
  }

  const handleDelete = async () => {
    await swalDeleteConfirm(
      `¿Eliminar la conversación de "${name}"?`, 'Se borran todos sus mensajes. Esta acción no se puede deshacer.',
      async ({ close, showError }) => {
        const ok = await deleteItem(row.original.id)
        if (ok) { toastSuccess('Conversación eliminada', name); close() }
        else showError(useChatbotConversationDeleteStore.getState().error ?? 'No se pudo eliminar la conversación.')
      },
      { title: 'Eliminando...' }
    )
  }

  const otherStatuses = CHATBOT_CONVERSATION_STATUSES.filter((s) => s.value !== row.original.status)

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={() => go(`/chatbot/conversations/${row.original.id}`)}>
          Ver conversación <DropdownMenuShortcut><Eye size={16} /></DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => go(`/chatbot/visitors/${row.original.visitor.id}`)}>
          Ver visitante <DropdownMenuShortcut><UserRound size={16} /></DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {otherStatuses.map((s) => (
          <DropdownMenuItem key={s.value} onClick={() => void handleChangeStatus(s.value)}>
            Marcar como {s.label} <DropdownMenuShortcut>{CHATBOT_STATUS_ICONS[s.value]}</DropdownMenuShortcut>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void handleDelete()} className="text-red-500!">
          Eliminar <DropdownMenuShortcut><Trash2 size={16} /></DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
