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
import { swalConfirm, swalDeleteConfirm } from '@/shared/lib/swal'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { useSectionImageListStore } from '../../stores/useSectionImageListStore'
import { useSectionImageDeleteStore } from '../../stores/useSectionImageDeleteStore'
import type { SectionImage } from '../../data/schema'

export function SectionImagesRowActions({ row }: { row: Row<SectionImage> }) {
  const router = useRouter()
  const { setCurrentItem } = useSectionImageListStore()
  const { toggleState, deleteItem } = useSectionImageDeleteStore()

  const isActive = row.original.stateValue === 1
  const label    = `${row.original.sectionName} — ${row.original.imageName}`

  const handleView = () => {
    setCurrentItem(row.original)
    NProgress.start()
    router.push(`/section-images/${row.original.id}`)
  }

  const handleEdit = () => {
    setCurrentItem(row.original)
    NProgress.start()
    router.push(`/section-images/edit/${row.original.id}`)
  }

  const handleToggleState = async () => {
    const newState = isActive ? 0 : 1
    const actionLabel = newState === 1 ? 'Activar' : 'Desactivar'
    const confirmed = await swalConfirm({
      title: `¿${actionLabel} este registro?`,
      text: label,
      confirmText: 'Sí, continuar',
      cancelText: 'Cancelar',
    })
    if (!confirmed) return
    const resultLabel = newState === 1 ? 'activado' : 'desactivado'
    const ok = await toggleState(row.original.id, newState)
    if (ok) toastSuccess(`Registro ${resultLabel}`, label)
    else toastError('Error', 'No se pudo cambiar el estado.')
  }

  const handleDelete = async () => {
    const confirmed = await swalDeleteConfirm(`¿Eliminar este registro?`, 'Esta acción no se puede deshacer.')
    if (!confirmed) return
    const ok = await deleteItem(row.original.id)
    if (ok) toastSuccess('Registro eliminado', label)
    else toastError('Error al eliminar', 'No se pudo eliminar el registro.')
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
          {isActive
            ? <>Desactivar <DropdownMenuShortcut><XCircle size={16} /></DropdownMenuShortcut></>
            : <>Activar <DropdownMenuShortcut><CheckCircle2 size={16} /></DropdownMenuShortcut></>}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void handleDelete()} className="text-red-500!">
          Eliminar <DropdownMenuShortcut><Trash2 size={16} /></DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
