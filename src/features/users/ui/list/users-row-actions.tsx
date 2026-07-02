'use client'

import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { CheckCircle2, Eye, Trash2, UserPen, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'
import { Button } from '@/shared/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu'
import { swalConfirmAction, swalDeleteConfirm } from '@/shared/lib/swal'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { useUserListStore } from '@/features/users/stores/useUserListStore'
import { useUserDeleteStore } from '../../stores/useUserDeleteStore'
import type { User } from '../../data/schema'

export function UsersRowActions({ row }: { row: Row<User> }) {
  const router = useRouter()
  const { setCurrentUser } = useUserListStore()
  const { toggleState, deleteItem } = useUserDeleteStore()

  const isActive = row.original.status === 'active'

  const handleView = () => {
    setCurrentUser(row.original)
    NProgress.start()
    router.push(`/users/${row.original.id}`)
  }

  const handleEdit = () => {
    setCurrentUser(row.original)
    NProgress.start()
    router.push(`/users/edit/${row.original.id}`)
  }

  const handleToggleState = async () => {
    const newState = isActive ? 0 : 1
    const actionLabel = isActive ? 'desactivar' : 'activar'
    await swalConfirmAction({
      title: `¿${isActive ? 'Desactivar' : 'Activar'} usuario?`,
      text: `¿Deseas ${actionLabel} a ${row.original.firstName} ${row.original.lastName}?`,
      confirmText: `Sí, ${actionLabel}`,
      cancelText: 'Cancelar',
      loading: { title: newState === 1 ? 'Activando...' : 'Desactivando...' },
      action: async ({ close, showError }) => {
        const ok = await toggleState(row.original.id, newState)
        if (ok) {
          toastSuccess(
            isActive ? 'Usuario desactivado' : 'Usuario activado',
            `${row.original.firstName} ${row.original.lastName} fue ${isActive ? 'desactivado' : 'activado'}.`
          )
          close()
        } else {
          showError('No se pudo cambiar el estado del usuario.')
        }
      },
    })
  }

  const handleDelete = async () => {
    await swalDeleteConfirm(
      `¿Eliminar a ${row.original.firstName} ${row.original.lastName}?`,
      'Esta acción no se puede deshacer.',
      async ({ close, showError }) => {
        const ok = await deleteItem(row.original.id)
        if (ok) {
          toastSuccess('Usuario eliminado', `${row.original.firstName} ${row.original.lastName} fue eliminado.`)
          close()
        } else {
          showError('No se pudo eliminar el usuario. Intenta nuevamente.')
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
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={handleView}>
          Ver detalle <DropdownMenuShortcut><Eye size={16} /></DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEdit}>
          Editar <DropdownMenuShortcut><UserPen size={16} /></DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void handleToggleState()}>
          {isActive
            ? <><span>Desactivar</span> <DropdownMenuShortcut><XCircle size={16} /></DropdownMenuShortcut></>
            : <><span>Activar</span> <DropdownMenuShortcut><CheckCircle2 size={16} /></DropdownMenuShortcut></>}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void handleDelete()} className="text-red-500!">
          Eliminar <DropdownMenuShortcut><Trash2 size={16} /></DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
