'use client'

import { useState } from 'react'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Download, Eye, Loader2, Pencil, Repeat, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { swalConfirmAction, swalDeleteConfirm } from '@/shared/lib/swal'
import { saveFile } from '@/shared/lib/save-file'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { useProformaListStore } from '../../stores/useProformaListStore'
import { useProformaDeleteStore } from '../../stores/useProformaDeleteStore'
import { proformasService } from '../../services/proformas.service'
import { getProformaStatusOption, getValidStatusTransitions } from '../../data/data'
import type { Proforma, ProformaStatus } from '../../data/schema'

export function ProformasRowActions({ row }: { row: Row<Proforma> }) {
  const router = useRouter()
  const { setCurrentItem } = useProformaListStore()
  const { deleteItem, changeStatus } = useProformaDeleteStore()
  const [isDownloading, setIsDownloading] = useState(false)
  const transitions = getValidStatusTransitions(row.original.status)

  const handleView = () => {
    setCurrentItem(row.original)
    NProgress.start()
    router.push(`/proformas/${row.original.id}`)
  }

  const handleEdit = () => {
    setCurrentItem(row.original)
    NProgress.start()
    router.push(`/proformas/edit/${row.original.id}`)
  }

  const handleDownloadPdf = async () => {
    setIsDownloading(true)
    try {
      const blob = await proformasService.downloadPdf(row.original.id)
      await saveFile(blob, `${row.original.code}.pdf`)
    } catch {
      toastError('Error', 'No se pudo descargar el PDF.')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleChangeStatus = async (newStatus: ProformaStatus) => {
    const opt = getProformaStatusOption(newStatus)
    await swalConfirmAction({
      title: `¿Cambiar estado a "${opt.label}"?`,
      text: row.original.code,
      confirmText: 'Sí, continuar',
      cancelText: 'Cancelar',
      loading: { title: 'Actualizando estado...' },
      action: async ({ close, showError }) => {
        const ok = await changeStatus(row.original.id, newStatus)
        if (ok) {
          toastSuccess('Estado actualizado', `"${row.original.code}" ahora está ${opt.label.toLowerCase()}.`)
          close()
        } else {
          showError('No se pudo cambiar el estado.')
        }
      },
    })
  }

  const handleDelete = async () => {
    await swalDeleteConfirm(
      `¿Eliminar "${row.original.code}"?`,
      'Esta acción eliminará también sus líneas de detalle y no se puede deshacer.',
      async ({ close, showError }) => {
        const ok = await deleteItem(row.original.id)
        if (ok) {
          toastSuccess('Registro eliminado', `"${row.original.code}" fue eliminado.`)
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
      {/* El `span` intermedio evita que el `data-state` del tooltip pise el `data-state="open"/
          "closed"` que usa el propio DropdownMenuTrigger para resaltarse. Necesita tamaño real
          (`inline-flex`, no `contents`) porque Tooltip posiciona su contenido según el rect de
          este nodo. */}
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="data-[state=open]:bg-muted flex h-8 w-8 p-0">
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
          Ver detalle{' '}
          <DropdownMenuShortcut>
            <Eye size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        {row.original.status === 'PENDIENTE' && (
          <DropdownMenuItem onClick={handleEdit}>
            Editar{' '}
            <DropdownMenuShortcut>
              <Pencil size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => void handleDownloadPdf()} disabled={isDownloading}>
          Descargar PDF{' '}
          <DropdownMenuShortcut>
            {isDownloading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        {transitions.length > 0 && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              Cambiar estado{' '}
              <DropdownMenuShortcut>
                <Repeat size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {transitions.map((t) => (
                <DropdownMenuItem key={t.value} onClick={() => void handleChangeStatus(t.value)}>
                  {t.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void handleDelete()} className="text-red-500!">
          Eliminar{' '}
          <DropdownMenuShortcut>
            <Trash2 size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
