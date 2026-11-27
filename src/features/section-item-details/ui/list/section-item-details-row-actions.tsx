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
import { toastSuccess } from '@/shared/lib/toast'
import { useSectionItemDetailListStore } from '../../stores/useSectionItemDetailListStore'
import { useSectionItemDetailDeleteStore } from '../../stores/useSectionItemDetailDeleteStore'
import type { SectionItemDetail } from '../../data/schema'
import { useCan } from '@/features/auth/hooks/usePermission'

export function SectionItemDetailsRowActions({ row }: { row: Row<SectionItemDetail> }) {
  const router = useRouter()
  const { setCurrentItem } = useSectionItemDetailListStore()
  const { toggleState, deleteItem } = useSectionItemDetailDeleteStore()

  // Cada acción solo se muestra si tiene su permiso (ver ROLES_Y_PERMISOS.md)
  const canView = useCan('section_items.view')
  const canEdit = useCan('section_items.update')
  const canState = useCan('section_items.state')
  const canDelete = useCan('section_items.delete')

  const isActive = row.original.stateValue === 1
  const label = row.original.title ?? `Detalle #${row.original.id}`

  const handleView = () => {
    setCurrentItem(row.original)
    NProgress.start()
    router.push(`/section-item-details/${row.original.id}`)
  }

  const handleEdit = () => {
    setCurrentItem(row.original)
    NProgress.start()
    router.push(`/section-item-details/edit/${row.original.id}`)
  }

  const handleToggleState = async () => {
    const newState = isActive ? 0 : 1
    const actionLabel = newState === 1 ? 'Activar' : 'Desactivar'
    const resultLabel = newState === 1 ? 'activado' : 'desactivado'
    await swalConfirmAction({
      title: `¿${actionLabel} este detalle?`,
      text: label,
      confirmText: 'Sí, continuar',
      cancelText: 'Cancelar',
      loading: { title: newState === 1 ? 'Activando...' : 'Desactivando...' },
      action: async ({ close, showError }) => {
        const ok = await toggleState(row.original.id, newState)
        if (ok) {
          toastSuccess(`Detalle ${resultLabel}`, `"${label}" fue ${resultLabel}.`)
          close()
        } else {
          showError('No se pudo cambiar el estado.')
        }
      },
    })
  }

  const handleDelete = async () => {
    await swalDeleteConfirm(
      `¿Eliminar "${label}"?`, 'Esta acción no se puede deshacer.',
      async ({ close, showError }) => {
        const ok = await deleteItem(row.original.id)
        if (ok) {
          toastSuccess('Detalle eliminado', `"${label}" fue eliminado.`)
          close()
        } else {
          showError('No se pudo eliminar el registro.')
        }
      },
      { title: 'Eliminando...' }
    )
  }

  // Sin ninguna acción permitida no mostramos el menú "..."
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
                : <>Activar <DropdownMenuShortcut><CheckCircle2 size={16} /></DropdownMenuShortcut></>}
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
