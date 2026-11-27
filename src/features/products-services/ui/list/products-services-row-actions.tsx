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
import { useProductServiceListStore } from '../../stores/useProductServiceListStore'
import { useProductServiceDeleteStore } from '../../stores/useProductServiceDeleteStore'
import { useCan } from '@/features/auth/hooks/usePermission'
import type { ProductService } from '../../data/schema'

export function ProductsServicesRowActions({ row }: { row: Row<ProductService> }) {
  const router = useRouter()
  const { setCurrentItem } = useProductServiceListStore()
  const { toggleState, deleteItem } = useProductServiceDeleteStore()
  // Permisos de productos y servicios (ver ROLES_Y_PERMISOS.md)
  const canView = useCan('products_services.view')
  const canUpdate = useCan('products_services.update')
  const canState = useCan('products_services.state')
  const canDelete = useCan('products_services.delete')

  const isActive = row.original.stateValue === 1

  const handleView = () => {
    setCurrentItem(row.original)
    NProgress.start()
    router.push(`/products-services/${row.original.id}`)
  }

  const handleEdit = () => {
    setCurrentItem(row.original)
    NProgress.start()
    router.push(`/products-services/edit/${row.original.id}`)
  }

  const handleToggleState = async () => {
    const newState = isActive ? 0 : 1
    const actionLabel = newState === 1 ? 'activar' : 'desactivar'
    const resultLabel = newState === 1 ? 'activado' : 'desactivado'
    await swalConfirmAction({
      title: `¿${actionLabel.charAt(0).toUpperCase() + actionLabel.slice(1)} este registro?`,
      text: row.original.name,
      confirmText: 'Sí, continuar',
      cancelText: 'Cancelar',
      loading: { title: newState === 1 ? 'Activando...' : 'Desactivando...' },
      action: async ({ close, showError }) => {
        const ok = await toggleState(row.original.id, newState)
        if (ok) {
          toastSuccess(`Registro ${resultLabel}`, `"${row.original.name}" fue ${resultLabel}.`)
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
          toastSuccess('Registro eliminado', `"${row.original.name}" fue eliminado.`)
          close()
        } else {
          showError('No se pudo eliminar el registro.')
        }
      },
      { title: 'Eliminando...' }
    )
  }

  // Sin ninguna acción permitida no se muestra el menú
  if (!canView && !canUpdate && !canState && !canDelete) return null

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
        {canUpdate && (
          <DropdownMenuItem onClick={handleEdit}>
            Editar <DropdownMenuShortcut><Pencil size={16} /></DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
        {canState && (
          <>
            {(canView || canUpdate) && <DropdownMenuSeparator />}
            <DropdownMenuItem onClick={() => void handleToggleState()}>
              {isActive
                ? <>Desactivar <DropdownMenuShortcut><XCircle size={16} /></DropdownMenuShortcut></>
                : <>Activar <DropdownMenuShortcut><CheckCircle2 size={16} /></DropdownMenuShortcut></>}
            </DropdownMenuItem>
          </>
        )}
        {canDelete && (
          <>
            {(canView || canUpdate || canState) && <DropdownMenuSeparator />}
            <DropdownMenuItem onClick={() => void handleDelete()} className="text-red-500!">
              Eliminar <DropdownMenuShortcut><Trash2 size={16} /></DropdownMenuShortcut>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
