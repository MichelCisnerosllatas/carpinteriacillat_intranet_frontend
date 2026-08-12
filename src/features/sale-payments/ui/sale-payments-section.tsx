// src/features/sale-payments/ui/sale-payments-section.tsx
'use client'

import { useEffect, useState } from 'react'
import { CreditCard, Loader2, Lock, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { swalDeleteConfirm } from '@/shared/lib/swal'
import { toastSuccess } from '@/shared/lib/toast'
import { formatDisplayDate } from '@/shared/lib/utils'
import { useSalePaymentListStore } from '../stores/useSalePaymentListStore'
import { useSalePaymentDeleteStore } from '../stores/useSalePaymentDeleteStore'
import { SalePaymentFormDialog } from './sale-payment-form-dialog'
import type { SalePayment } from '../data/schema'

interface SalePaymentsSectionProps {
  saleId: number
  /** true cuando la venta está ANULADA — los pagos se bloquean solo en ese estado, a diferencia
   * de las líneas de detalle (que además se bloquean en EMITIDA), ver sale-payments.md. */
  readOnly: boolean
  amountPaid: number
  balance: number
  currency: string
}

const formatCurrency = (value: number, currency: string) => `${currency} ${value.toFixed(2)}`

/** Card "Cobros" — CRUD interactivo de pagos/adelantos de una venta, embebido en
 * `sale-detail.tsx`. Reemplaza el bloque de solo lectura original (ver el TODO que quitó). */
export function SalePaymentsSection({ saleId, readOnly, amountPaid, balance, currency }: SalePaymentsSectionProps) {
  const { items, isFetching, loadBySale } = useSalePaymentListStore()
  const { deleteItem } = useSalePaymentDeleteStore()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPayment, setEditingPayment] = useState<SalePayment | null>(null)

  useEffect(() => {
    void loadBySale(saleId)
  }, [saleId])

  const handleAdd = () => {
    setEditingPayment(null)
    setDialogOpen(true)
  }

  const handleEdit = (payment: SalePayment) => {
    setEditingPayment(payment)
    setDialogOpen(true)
  }

  const handleDelete = async (payment: SalePayment) => {
    await swalDeleteConfirm(
      `¿Eliminar este pago de ${formatCurrency(payment.amount, currency)}?`,
      'Esta acción no se puede deshacer.',
      async ({ close, showError }) => {
        const ok = await deleteItem(payment.id, saleId)
        if (ok) {
          toastSuccess('Pago eliminado', formatCurrency(payment.amount, currency))
          close()
        } else {
          showError('No se pudo eliminar el pago.')
        }
      },
      { title: 'Eliminando...' }
    )
  }

  return (
    <Card className="gap-3 py-4">
      <CardHeader className="flex flex-row items-center justify-between px-4 pb-0">
        <CardTitle className="flex items-center gap-2 text-sm">
          <CreditCard className="size-4" />
          Cobros
        </CardTitle>
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground text-xs">
            Pagado {formatCurrency(amountPaid, currency)} · Saldo {formatCurrency(balance, currency)}
          </span>
          {!readOnly && (
            <Button size="sm" variant="outline" onClick={handleAdd}>
              <Plus className="mr-1 size-3.5" />
              Agregar pago
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4">
        {readOnly && (
          <div className="text-muted-foreground mb-3 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
            <Lock className="size-4 shrink-0" />
            Esta venta está Anulada — no se pueden registrar ni editar pagos.
          </div>
        )}

        {isFetching && items.length === 0 ? (
          <div className="text-muted-foreground flex items-center justify-center gap-2 py-8 text-sm">
            <Loader2 className="size-4 animate-spin" />
            Cargando pagos...
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-1 rounded-lg border border-dashed py-8 text-center">
            <CreditCard className="text-muted-foreground/50 mb-2 size-8" />
            <p className="text-sm font-medium">Todavía no se registraron pagos</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y">
            {items.map((p) => (
              <div key={p.id} className="flex items-start justify-between gap-3 py-2">
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-tight">{p.paymentMethod ?? 'Pago'}</span>
                  <span className="text-muted-foreground text-xs">{formatDisplayDate(p.paymentDate)}</span>
                  {p.observation && <span className="text-muted-foreground text-xs">{p.observation}</span>}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-sm font-medium tabular-nums">{formatCurrency(p.amount, currency)}</span>
                  {!readOnly && (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-7" onClick={() => handleEdit(p)}>
                            <Pencil className="size-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Editar pago</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive size-7"
                            onClick={() => void handleDelete(p)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Eliminar pago</TooltipContent>
                      </Tooltip>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <SalePaymentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        saleId={saleId}
        balance={balance}
        currency={currency}
        editingPayment={editingPayment}
      />
    </Card>
  )
}
