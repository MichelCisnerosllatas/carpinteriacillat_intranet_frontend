'use client'

import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Eye, Pencil, Repeat, Trash2 } from 'lucide-react'
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { useSaleListStore } from '../../stores/useSaleListStore'
import { useSaleDeleteStore } from '../../stores/useSaleDeleteStore'
import { getSaleStatusOption, getValidStatusTransitions, formatSaleCurrency } from '../../data/data'
import type { Sale, SaleStatus } from '../../data/schema'

export function SalesRowActions({ row }: { row: Row<Sale> }) {
  const router = useRouter()
  const { setCurrentItem } = useSaleListStore()
  const { deleteItem, changeStatus } = useSaleDeleteStore()
  // payment_status NUNCA se cambia desde acá — solo `status` (ciclo de vida del documento) tiene
  // transiciones editables, ver «Conceptos clave» punto 5-6 en sales.md.
  const transitions = getValidStatusTransitions(row.original.status)

  const handleView = () => {
    setCurrentItem(row.original)
    NProgress.start()
    router.push(`/sales/${row.original.id}`)
  }

  const handleEdit = () => {
    setCurrentItem(row.original)
    NProgress.start()
    router.push(`/sales/edit/${row.original.id}`)
  }

  const handleChangeStatus = async (newStatus: SaleStatus) => {
    const opt = getSaleStatusOption(newStatus)
    const sale = row.original
    // `status` (documento) y `payment_status` (cobro) son independientes a propósito — se puede
    // emitir con saldo pendiente, el cobro normalmente sigue durante la fabricación (ver
    // «Conceptos clave» punto 5 en sales.md). Esto NO bloquea nada — solo avisa, para que no se
    // emita una venta sin pagos por descuido, quedando "perdida de vista" del cobro.
    const willEmitUnpaid = newStatus === 'EMITIDA' && sale.paymentStatus !== 'PAGADO'

    await swalConfirmAction({
      title: `¿Cambiar estado a "${opt.label}"?`,
      text: willEmitUnpaid
        ? `${sale.code} — todavía tiene un saldo pendiente de ${formatSaleCurrency(sale.balance, sale.currency)}. Puedes emitirla igual y seguir cobrando después.`
        : sale.code,
      icon: willEmitUnpaid ? 'warning' : undefined,
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
      'Esta acción eliminará también sus líneas de detalle y pagos, y no se puede deshacer.',
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
        {row.original.status === 'GUARDADA' && (
          <DropdownMenuItem onClick={handleEdit}>
            Editar{' '}
            <DropdownMenuShortcut>
              <Pencil size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
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
