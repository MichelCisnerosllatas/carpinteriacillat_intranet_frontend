'use client'

import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react'
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
import { useWebWorkListStore } from '../../stores/useWebWorkListStore'
import { useWebWorkDeleteStore } from '../../stores/useWebWorkDeleteStore'
import type { WebWork } from '../../data/schema'

export function WebWorksRowActions({ row }: { row: Row<WebWork> }) {
  const router = useRouter()
  const { setCurrentItem } = useWebWorkListStore()
  const { toggleState, deleteItem } = useWebWorkDeleteStore()

  const isVisible = row.original.stateValue === 1

  const handleView = () => {
    setCurrentItem(row.original)
    NProgress.start()
    router.push(`/web-works/${row.original.id}`)
  }

  const handleEdit = () => {
    setCurrentItem(row.original)
    NProgress.start()
    router.push(`/web-works/edit/${row.original.id}`)
  }

  const handleToggleState = async () => {
    const newState = isVisible ? 0 : 1
    await swalConfirmAction({
      title: newState === 1 ? '¿Mostrar este trabajo en la web?' : '¿Ocultar este trabajo de la web?',
      text: row.original.title,
      confirmText: 'Sí, continuar',
      cancelText: 'Cancelar',
      loading: { title: newState === 1 ? 'Mostrando...' : 'Ocultando...' },
      action: async ({ close, showError }) => {
        const ok = await toggleState(row.original.id, newState)
        if (ok) {
          toastSuccess(newState === 1 ? 'Trabajo visible' : 'Trabajo oculto', `"${row.original.title}"`)
          close()
        } else {
          showError(useWebWorkDeleteStore.getState().error ?? 'No se pudo cambiar el estado.')
        }
      },
    })
  }

  const handleDelete = async () => {
    await swalDeleteConfirm(
      `¿Eliminar "${row.original.title}"?`, 'Se borran también sus fotos de galería y pares Antes/Después (las imágenes siguen en el banco). Esta acción no se puede deshacer.',
      async ({ close, showError }) => {
        const ok = await deleteItem(row.original.id)
        if (ok) {
          toastSuccess('Trabajo eliminado', `"${row.original.title}" fue eliminado.`)
          close()
        } else {
          showError(useWebWorkDeleteStore.getState().error ?? 'No se pudo eliminar el trabajo.')
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
          {isVisible
            ? <>Ocultar <DropdownMenuShortcut><EyeOff size={16} /></DropdownMenuShortcut></>
            : <>Mostrar <DropdownMenuShortcut><Eye size={16} /></DropdownMenuShortcut></>}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void handleDelete()} className="text-red-500!">
          Eliminar <DropdownMenuShortcut><Trash2 size={16} /></DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
