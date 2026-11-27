'use client'

import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Eye, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { swalDeleteConfirm } from '@/shared/lib/swal'
import { toastSuccess } from '@/shared/lib/toast'
import { visitorDisplayName } from '@/features/chatbot-conversations/data/data'
import { useChatbotVisitorDeleteStore } from '../../stores/useChatbotVisitorDeleteStore'
import type { ChatbotVisitor } from '../../data/schema'
import { useCan } from '@/features/auth/hooks/usePermission'

export function ChatbotVisitorsRowActions({ row }: { row: Row<ChatbotVisitor> }) {
  const router = useRouter()
  const { deleteItem } = useChatbotVisitorDeleteStore()
  // Cada acción se muestra solo si tiene su permiso (ver ROLES_Y_PERMISOS.md)
  const canView = useCan('chatbot_visitors.view')
  const canDelete = useCan('chatbot_visitors.delete')
  const name = visitorDisplayName(row.original)

  const handleDelete = async () => {
    await swalDeleteConfirm(
      `¿Eliminar a "${name}"?`, `Se borran también sus ${row.original.conversationsCount} conversación(es). Esta acción no se puede deshacer.`,
      async ({ close, showError }) => {
        const ok = await deleteItem(row.original.id)
        if (ok) { toastSuccess('Visitante eliminado', name); close() }
        else showError(useChatbotVisitorDeleteStore.getState().error ?? 'No se pudo eliminar el visitante.')
      },
      { title: 'Eliminando...' }
    )
  }

  // Sin ninguna acción permitida no mostramos el menú
  if (!canView && !canDelete) return null

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {canView && (
          <DropdownMenuItem onClick={() => { NProgress.start(); router.push(`/chatbot/visitors/${row.original.id}`) }}>
            Ver detalle <DropdownMenuShortcut><Eye size={16} /></DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
        {canDelete && (
          <>
            {canView && <DropdownMenuSeparator />}
            <DropdownMenuItem onClick={() => void handleDelete()} className="text-red-500!">
              Eliminar <DropdownMenuShortcut><Trash2 size={16} /></DropdownMenuShortcut>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
