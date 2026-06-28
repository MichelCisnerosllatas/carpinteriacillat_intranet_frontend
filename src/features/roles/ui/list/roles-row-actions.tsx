'use client'

import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { CheckCircle2, Eye, Pencil, Trash2, XCircle } from 'lucide-react'
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
import { swalConfirm, swalDeleteConfirm } from '@/shared/lib/swal'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { useRoleListStore } from '@/features/roles/stores/useRoleListStore'
import { useRoleDeleteStore } from '@/features/roles/stores/useRoleDeleteStore'
import type { Role } from '../../data/schema'

export function RolesRowActions({ row }: { row: Row<Role> }) {
  const router = useRouter()
  const { setCurrentRole } = useRoleListStore()
  const { toggleState, deleteItem } = useRoleDeleteStore()

  const isActive = row.original.status === 'active'

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

  const handleToggleState = async () => {
    const newState = isActive ? 0 : 1
    const actionLabel = newState === 1 ? 'Activar' : 'Desactivar'
    const confirmed = await swalConfirm({
      title: `¿${actionLabel} este rol?`,
      text: row.original.name,
      confirmText: 'Sí, continuar',
      cancelText: 'Cancelar',
    })
    if (!confirmed) return
    const resultLabel = newState === 1 ? 'activado' : 'desactivado'
    const ok = await toggleState(row.original.id, newState)
    if (ok) toastSuccess(`Rol ${resultLabel}`, `"${row.original.name}" fue ${resultLabel}.`)
    else toastError('Error', 'No se pudo cambiar el estado.')
  }

  const handleDelete = async () => {
    const confirmed = await swalDeleteConfirm(
      `¿Eliminar el rol "${row.original.name}"?`,
      'Esta acción no se puede deshacer.'
    )
    if (!confirmed) return
    const ok = await deleteItem(row.original.id)
    if (ok) toastSuccess('Rol eliminado', `"${row.original.name}" fue eliminado.`)
    else toastError('Error al eliminar', 'No se pudo eliminar el rol. Intenta nuevamente.')
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
        <DropdownMenuItem onClick={handleView}>
          Ver detalle <DropdownMenuShortcut><Eye size={16} /></DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEdit}>
          Editar <DropdownMenuShortcut><Pencil size={16} /></DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void handleToggleState()}>
          {isActive ? (
            <>Desactivar <DropdownMenuShortcut><XCircle size={16} /></DropdownMenuShortcut></>
          ) : (
            <>Activar <DropdownMenuShortcut><CheckCircle2 size={16} /></DropdownMenuShortcut></>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void handleDelete()} className="text-red-500!">
          Eliminar <DropdownMenuShortcut><Trash2 size={16} /></DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
