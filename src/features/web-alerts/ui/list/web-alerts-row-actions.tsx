'use client'

// Menú "..." de cada fila de la tabla de alertas: Editar, Activar/Desactivar y Eliminar.

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
import { useWebAlertDeleteStore } from '../../stores/useWebAlertDeleteStore'
import type { WebAlert } from '../../data/schema'

export function WebAlertsRowActions({ row }: { row: Row<WebAlert> }) {
  const router = useRouter()
  const { toggleState, deleteItem } = useWebAlertDeleteStore()
  const name = row.original.title ?? row.original.subtitle ?? 'esta alerta'
  const isActive = row.original.stateValue === 1

  const handleEdit = () => {
    NProgress.start()
    router.push(`/web-alerts/edit/${row.original.id}`)
  }

  // Activa o desactiva la alerta (pide confirmación antes)
  const handleToggle = async () => {
    const newState = isActive ? 0 : 1
    await swalConfirmAction({
      title: newState === 1 ? '¿Activar esta alerta?' : '¿Desactivar esta alerta?',
      text: newState === 1
        ? `"${name}" se mostrará en la web (dentro de sus fechas).`
        : `"${name}" dejará de mostrarse en la web.`,
      confirmText: newState === 1 ? 'Sí, activar' : 'Sí, desactivar',
      cancelText: 'Cancelar',
      loading: { title: newState === 1 ? 'Activando...' : 'Desactivando...' },
      action: async ({ close, showError }) => {
        const ok = await toggleState(row.original.id, newState)
        if (ok) {
          toastSuccess(newState === 1 ? 'Alerta activada' : 'Alerta desactivada', name)
          close()
        } else {
          showError(useWebAlertDeleteStore.getState().error ?? 'No se pudo cambiar el estado.')
        }
      },
    })
  }

  const handleDelete = async () => {
    await swalDeleteConfirm(
      `¿Eliminar "${name}"?`, 'La alerta se borra y deja de verse en la web. Esta acción no se puede deshacer.',
      async ({ close, showError }) => {
        const ok = await deleteItem(row.original.id)
        if (ok) {
          toastSuccess('Alerta eliminada', `"${name}" fue eliminada.`)
          close()
        } else {
          showError(useWebAlertDeleteStore.getState().error ?? 'No se pudo eliminar la alerta.')
        }
      },
      { title: 'Eliminando...' }
    )
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={handleEdit}>
          Editar <DropdownMenuShortcut><Pencil size={16} /></DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void handleToggle()}>
          {isActive
            ? <>Desactivar <DropdownMenuShortcut><PowerOff size={16} /></DropdownMenuShortcut></>
            : <>Activar <DropdownMenuShortcut><Power size={16} /></DropdownMenuShortcut></>}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void handleDelete()} className="text-red-500!">
          Eliminar <DropdownMenuShortcut><Trash2 size={16} /></DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
