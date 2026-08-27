'use client'

import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { CheckCircle2, Eye, Trash2, XCircle, RotateCcw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { swalConfirmAction, swalDeleteConfirm } from '@/shared/lib/swal'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { toastSuccess } from '@/shared/lib/toast'
import { useContactMessageListStore } from '../../stores/useContactMessageListStore'
import { useContactMessageStatusStore } from '../../stores/useContactMessageStatusStore'
import { useContactMessageDeleteStore } from '../../stores/useContactMessageDeleteStore'
import { getContactMessageStatusOption } from '../../data/data'
import type { ContactMessage, ContactMessageStatus } from '../../data/schema'

export function ContactMessagesRowActions({ row }: { row: Row<ContactMessage> }) {
  const router = useRouter()
  const { setCurrentItem } = useContactMessageListStore()
  const { updateStatus } = useContactMessageStatusStore()
  const { deleteItem } = useContactMessageDeleteStore()

  const handleView = () => {
    setCurrentItem(row.original)
    NProgress.start()
    router.push(`/contact-messages/${row.original.id}`)
  }

  const handleChangeStatus = async (status: ContactMessageStatus) => {
    const label = getContactMessageStatusOption(status).label
    await swalConfirmAction({
      title: `¿Marcar como "${label}"?`,
      text: row.original.name,
      confirmText: 'Sí, continuar',
      cancelText: 'Cancelar',
      loading: { title: 'Actualizando...' },
      action: async ({ close, showError }) => {
        const ok = await updateStatus(row.original.id, status)
        if (ok) {
          toastSuccess('Estado actualizado', `"${row.original.name}" ahora está "${label}".`)
          close()
        } else {
          showError('No se pudo cambiar el estado.')
        }
      },
    })
  }

  const handleDelete = async () => {
    await swalDeleteConfirm(
      `¿Eliminar el mensaje de "${row.original.name}"?`, 'Esta acción no se puede deshacer.',
      async ({ close, showError }) => {
        const ok = await deleteItem(row.original.id)
        if (ok) {
          toastSuccess('Mensaje eliminado', `El mensaje de "${row.original.name}" fue eliminado.`)
          close()
        } else {
          showError('No se pudo eliminar el mensaje.')
        }
      },
      { title: 'Eliminando...' }
    )
  }

  const otherStatuses = (['nuevo', 'atendido', 'descartado'] as ContactMessageStatus[]).filter(
    (s) => s !== row.original.status
  )

  const statusIcon: Record<ContactMessageStatus, React.ReactNode> = {
    nuevo: <RotateCcw size={16} />,
    atendido: <CheckCircle2 size={16} />,
    descartado: <XCircle size={16} />,
  }

  return (
    <DropdownMenu modal={false}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
                <DotsHorizontalIcon className="h-4 w-4" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </DropdownMenuTrigger>
          </span>
        </TooltipTrigger>
        <TooltipContent>Más acciones</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleView}>
          Ver detalle <DropdownMenuShortcut><Eye size={16} /></DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {otherStatuses.map((status) => (
          <DropdownMenuItem key={status} onClick={() => void handleChangeStatus(status)}>
            Marcar como {getContactMessageStatusOption(status).label}
            <DropdownMenuShortcut>{statusIcon[status]}</DropdownMenuShortcut>
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
