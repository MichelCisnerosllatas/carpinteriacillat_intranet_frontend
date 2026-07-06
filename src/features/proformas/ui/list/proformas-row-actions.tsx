'use client'

import { useState } from 'react'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Download, Eye, Loader2, Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { swalDeleteConfirm } from '@/shared/lib/swal'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { useProformaListStore } from '../../stores/useProformaListStore'
import { useProformaDeleteStore } from '../../stores/useProformaDeleteStore'
import { proformasService } from '../../services/proformas.service'
import type { Proforma } from '../../data/schema'

export function ProformasRowActions({ row }: { row: Row<Proforma> }) {
  const router = useRouter()
  const { setCurrentItem } = useProformaListStore()
  const { deleteItem } = useProformaDeleteStore()
  const [isDownloading, setIsDownloading] = useState(false)

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
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${row.original.code}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch {
      toastError('Error', 'No se pudo descargar el PDF.')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleDelete = async () => {
    await swalDeleteConfirm(
      `¿Eliminar "${row.original.code}"?`, 'Esta acción eliminará también sus líneas de detalle y no se puede deshacer.',
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
        <DropdownMenuItem onClick={() => void handleDownloadPdf()} disabled={isDownloading}>
          Descargar PDF <DropdownMenuShortcut>{isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void handleDelete()} className="text-red-500!">
          Eliminar <DropdownMenuShortcut><Trash2 size={16} /></DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
