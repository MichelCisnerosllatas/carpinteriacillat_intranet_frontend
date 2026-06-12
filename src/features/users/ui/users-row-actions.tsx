'use client'

import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Eye, Trash2, UserPen } from 'lucide-react'
import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'
import { Button } from '@/shared/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu'
import { swalDeleteConfirm } from '@/shared/lib/swal'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { userService } from '@/features/users/services/user.service'
import { useUserListStore } from '@/features/users/stores/useUserListStore'
import type { User } from '../data/schema'

export function UsersRowActions({ row }: { row: Row<User> }) {
  const router = useRouter()
  const { load, setCurrentUser } = useUserListStore()

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

  const handleDelete = async () => {
    const confirmed = await swalDeleteConfirm(
      `¿Eliminar a ${row.original.firstName} ${row.original.lastName}?`,
      'Esta acción no se puede deshacer.'
    )
    if (!confirmed) return

    try {
      await userService.delete(row.original.id)
      toastSuccess('Usuario eliminado', `${row.original.firstName} ${row.original.lastName} fue eliminado.`)
      void load()
    } catch {
      toastError('Error al eliminar', 'No se pudo eliminar el usuario. Intenta nuevamente.')
    }
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
        <DropdownMenuItem onClick={() => void handleDelete()} className="text-red-500!">
          Eliminar <DropdownMenuShortcut><Trash2 size={16} /></DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
