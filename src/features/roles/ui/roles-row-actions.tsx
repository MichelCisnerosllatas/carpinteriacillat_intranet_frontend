'use client'

import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { swalDeleteConfirm } from '@/shared/lib/swal'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { rolesService } from '@/features/roles/services/roles.service'
import { useRoleListStore } from '@/features/roles/stores/useRoleListStore'
import type { Role } from '../data/schema'

export function RolesRowActions({ row }: { row: Row<Role> }) {
  const router = useRouter()
  const { load, setCurrentRole } = useRoleListStore()

  const handleView = () => {
    setCurrentRole(row.original)
    NProgress.start()
    router.push(`/roles/${row.original.id}`)
  }

  const handleEdit = () => {
    setCurrentRole(row.original)
    NProgress.start()
    router.push(`/roles/edit/${row.original.id}`)
  }

  const handleDelete = async () => {
    const confirmed = await swalDeleteConfirm(
      `¿Eliminar el rol "${row.original.name}"?`,
      'Esta acción no se puede deshacer.'
    )
    if (!confirmed) return

    try {
      await rolesService.delete(row.original.id)
      toastSuccess('Rol eliminado', `"${row.original.name}" fue eliminado.`)
      void load()
    } catch {
      toastError('Error al eliminar', 'No se pudo eliminar el rol. Intenta nuevamente.')
    }
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={handleView}>
          Ver detalle <DropdownMenuShortcut><Eye size={16} /></DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEdit}>
          Editar <DropdownMenuShortcut><Pencil size={16} /></DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void handleDelete()} className="text-red-500!">
          Eliminar <DropdownMenuShortcut><Trash2 size={16} /></DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
