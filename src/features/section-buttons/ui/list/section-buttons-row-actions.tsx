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
import { useSectionButtonListStore } from '../../stores/useSectionButtonListStore'
import { useSectionButtonDeleteStore } from '../../stores/useSectionButtonDeleteStore'
import type { SectionButton } from '../../data/schema'

interface SectionButtonsRowActionsProps {
  row: Row<SectionButton>
  /** El tipo de sección de este botón tiene `web_settings.buttons_delete: false` — no se puede eliminar, solo editar texto/visibilidad. Ver `SectionDetailButtonsTab`. */
  hideDelete?: boolean
}

export function SectionButtonsRowActions({ row, hideDelete = false }: SectionButtonsRowActionsProps) {
  const router = useRouter()
  const { setCurrentItem } = useSectionButtonListStore()
  const { toggleState, deleteItem } = useSectionButtonDeleteStore()

  const isActive = row.original.stateValue === 1

  const handleView = () => {
    setCurrentItem(row.original)
    NProgress.start()
    router.push(`/section-buttons/${row.original.id}`)
  }

  const handleEdit = () => {
    setCurrentItem(row.original)
    NProgress.start()
    router.push(`/section-buttons/edit/${row.original.id}`)
  }

  const handleToggleState = async () => {
    const newState = isActive ? 0 : 1
    const actionLabel = newState === 1 ? 'Activar' : 'Desactivar'
    const resultLabel = newState === 1 ? 'activado' : 'desactivado'
    await swalConfirmAction({
      title: `¿${actionLabel} este botón?`,
      text: row.original.label,
      confirmText: 'Sí, continuar',
      cancelText: 'Cancelar',
      loading: { title: newState === 1 ? 'Activando...' : 'Desactivando...' },
      action: async ({ close, showError }) => {
        const ok = await toggleState(row.original.id, newState)
        if (ok) {
          toastSuccess(`Botón ${resultLabel}`, `"${row.original.label}" fue ${resultLabel}.`)
          close()
        } else {
          showError('No se pudo cambiar el estado.')
        }
      },
    })
  }

  const handleDelete = async () => {
    await swalDeleteConfirm(
      `¿Eliminar "${row.original.label}"?`, 'Esta acción no se puede deshacer.',
      async ({ close, showError }) => {
        const ok = await deleteItem(row.original.id)
        if (ok) {
          toastSuccess('Botón eliminado', `"${row.original.label}" fue eliminado.`)
          close()
        } else {
          showError('No se pudo eliminar el registro.')
        }
      },
      { title: 'Eliminando...' }
    )
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
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={handleView}>
          Ver detalle <DropdownMenuShortcut><Eye size={16} /></DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEdit}>
          Editar <DropdownMenuShortcut><Pencil size={16} /></DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void handleToggleState()}>
          {isActive
            ? <>Desactivar <DropdownMenuShortcut><XCircle size={16} /></DropdownMenuShortcut></>
            : <>Activar <DropdownMenuShortcut><CheckCircle2 size={16} /></DropdownMenuShortcut></>}
        </DropdownMenuItem>
        {!hideDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => void handleDelete()} className="text-red-500!">
              Eliminar <DropdownMenuShortcut><Trash2 size={16} /></DropdownMenuShortcut>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
