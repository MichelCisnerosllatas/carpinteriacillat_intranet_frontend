'use client'

import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Pencil, Power, PowerOff, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { swalConfirmAction, swalDeleteConfirm } from '@/shared/lib/swal'
import { toastSuccess } from '@/shared/lib/toast'
import { useChatbotOptionDeleteStore } from '../../stores/useChatbotOptionDeleteStore'
import type { ChatbotOption } from '../../data/schema'
import { useCan } from '@/features/auth/hooks/usePermission'

export function ChatbotOptionsRowActions({ row }: { row: Row<ChatbotOption> }) {
  const router = useRouter()
  const { toggleState, deleteItem } = useChatbotOptionDeleteStore()
  // Cada acción se muestra solo si tiene su permiso (ver ROLES_Y_PERMISOS.md)
  const canEdit = useCan('chatbot_options.update')
  const canState = useCan('chatbot_options.state')
  const canDelete = useCan('chatbot_options.delete')
  const name = row.original.title
  const isActive = row.original.state

  const handleEdit = () => {
    NProgress.start()
    router.push(`/chatbot/options/edit/${row.original.id}`)
  }

  const handleToggle = async () => {
    const newState = !isActive
    await swalConfirmAction({
      title: newState ? '¿Activar esta opción?' : '¿Desactivar esta opción?',
      text: newState ? `"${name}" aparecerá en la pantalla inicial del chatbot.` : `"${name}" dejará de aparecer en el chatbot.`,
      confirmText: newState ? 'Sí, activar' : 'Sí, desactivar',
      cancelText: 'Cancelar',
      loading: { title: newState ? 'Activando...' : 'Desactivando...' },
      action: async ({ close, showError }) => {
        const ok = await toggleState(row.original.id, newState)
        if (ok) {
          toastSuccess(newState ? 'Opción activada' : 'Opción desactivada', name)
          close()
        } else {
          showError(useChatbotOptionDeleteStore.getState().error ?? 'No se pudo cambiar el estado.')
        }
      },
    })
  }

  const handleDelete = async () => {
    await swalDeleteConfirm(
      `¿Eliminar "${name}"?`, 'La opción deja de verse en el chatbot. Las conversaciones que la usaron se conservan.',
      async ({ close, showError }) => {
        const ok = await deleteItem(row.original.id)
        if (ok) {
          toastSuccess('Opción eliminada', `"${name}" fue eliminada.`)
          close()
        } else {
          showError(useChatbotOptionDeleteStore.getState().error ?? 'No se pudo eliminar la opción.')
        }
      },
      { title: 'Eliminando...' }
    )
  }

  // Sin ninguna acción permitida no mostramos el menú
  if (!canEdit && !canState && !canDelete) return null

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {canEdit && (
        <DropdownMenuItem onClick={handleEdit}>
          Editar <DropdownMenuShortcut><Pencil size={16} /></DropdownMenuShortcut>
        </DropdownMenuItem>
        )}
        {canState && (
        <DropdownMenuItem onClick={() => void handleToggle()}>
          {isActive
            ? <>Desactivar <DropdownMenuShortcut><PowerOff size={16} /></DropdownMenuShortcut></>
            : <>Activar <DropdownMenuShortcut><Power size={16} /></DropdownMenuShortcut></>}
        </DropdownMenuItem>
        )}
        {canDelete && (
          <>
            {(canEdit || canState) && <DropdownMenuSeparator />}
            <DropdownMenuItem onClick={() => void handleDelete()} className="text-red-500!">
              Eliminar <DropdownMenuShortcut><Trash2 size={16} /></DropdownMenuShortcut>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
