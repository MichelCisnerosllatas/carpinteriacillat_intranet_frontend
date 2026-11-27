'use client'

import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { CheckCircle2, Eye, Pencil, Trash2, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { swalConfirmAction, swalDeleteConfirm } from '@/shared/lib/swal'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { useTestimonyListStore } from '../../stores/useTestimonyListStore'
import { useTestimonyDeleteStore } from '../../stores/useTestimonyDeleteStore'
import type { Testimony } from '../../data/schema'
import { TESTIMONY_STATE_PENDING } from '../../data/data'
import { useCan } from '@/features/auth/hooks/usePermission'

interface TestimonyRowActionsProps {
  row: Row<Testimony>
  hideDelete?: boolean
}

export function TestimonyRowActions({ row, hideDelete = false }: TestimonyRowActionsProps) {
  const router = useRouter()
  const { setCurrentItem } = useTestimonyListStore()
  const { toggleState, deleteItem } = useTestimonyDeleteStore()
  // Cada acción se muestra solo si tiene su permiso (ver ROLES_Y_PERMISOS.md)
  const canView = useCan('testimonies.view')
  const canEdit = useCan('testimonies.update')
  const canState = useCan('testimonies.state')
  const hasDeletePermission = useCan('testimonies.delete')
  const canDelete = !hideDelete && hasDeletePermission

  const isActive = row.original.stateValue === 1
  // Pendiente (2): reseña enviada desde la web. "Activar" la aprueba (pasa a 1 = Mostrado).
  const isPending = row.original.stateValue === TESTIMONY_STATE_PENDING

  const handleView = () => {
    setCurrentItem(row.original)
    NProgress.start()
    router.push(`/testimony/${row.original.id}`)
  }

  const handleEdit = () => {
    setCurrentItem(row.original)
    NProgress.start()
    router.push(`/testimony/edit/${row.original.id}`)
  }

  const handleToggleState = async () => {
    const newState = isActive ? 0 : 1
    const actionLabel = isPending ? 'Aprobar' : newState === 1 ? 'Activar' : 'Desactivar'
    const resultLabel = isPending ? 'aprobado' : newState === 1 ? 'activado' : 'desactivado'
    await swalConfirmAction({
      title: `¿${actionLabel} este testimonio?`,
      text: row.original.name,
      confirmText: 'Sí, continuar',
      cancelText: 'Cancelar',
      loading: { title: newState === 1 ? 'Activando...' : 'Desactivando...' },
      action: async ({ close, showError }) => {
        const ok = await toggleState(row.original.id, newState)
        if (ok) {
          toastSuccess(`Testimonio ${resultLabel}`, `"${row.original.name}" fue ${resultLabel}.`)
          close()
        } else {
          showError('No se pudo cambiar el estado.')
        }
      },
    })
  }

  const handleDelete = async () => {
    await swalDeleteConfirm(
      `¿Eliminar "${row.original.name}"?`, 'Esta acción no se puede deshacer.',
      async ({ close, showError }) => {
        const ok = await deleteItem(row.original.id)
        if (ok) {
          toastSuccess('Testimonio eliminado', `"${row.original.name}" fue eliminado.`)
          close()
        } else {
          showError('No se pudo eliminar el registro.')
        }
      },
      { title: 'Eliminando...' }
    )
  }

  // Sin ninguna acción permitida no mostramos el menú
  if (!canView && !canEdit && !canState && !canDelete) return null

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
      <DropdownMenuContent align="end" className="w-44">
        {canView && (
          <DropdownMenuItem onClick={handleView}>
            Ver detalle <DropdownMenuShortcut><Eye size={16} /></DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
        {canEdit && (
          <DropdownMenuItem onClick={handleEdit}>
            Editar <DropdownMenuShortcut><Pencil size={16} /></DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
        {canState && (
          <>
            {(canView || canEdit) && <DropdownMenuSeparator />}
            <DropdownMenuItem onClick={() => void handleToggleState()}>
              {isActive
                ? <>Desactivar <DropdownMenuShortcut><XCircle size={16} /></DropdownMenuShortcut></>
                : <>{isPending ? 'Aprobar' : 'Activar'} <DropdownMenuShortcut><CheckCircle2 size={16} /></DropdownMenuShortcut></>}
            </DropdownMenuItem>
          </>
        )}
        {canDelete && (
          <>
            {(canView || canEdit || canState) && <DropdownMenuSeparator />}
            <DropdownMenuItem onClick={() => void handleDelete()} className="text-red-500!">
              Eliminar <DropdownMenuShortcut><Trash2 size={16} /></DropdownMenuShortcut>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
