// src/features/sale-payments/ui/sale-payment-form-dialog.tsx
'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Wallet } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { applyApiErrors } from '@/shared/lib/api-errors'
import { AlertError } from '@/widgets/alerts_components'
import { toastSuccess } from '@/shared/lib/toast'
import { useSalePaymentFormStore } from '../stores/useSalePaymentFormStore'
import type { SalePayment } from '../data/schema'

const schema = z.object({
  amount: z.number({ error: 'Ingrese un monto válido.' }).min(0.01, 'El monto debe ser mayor a 0.'),
  payment_date: z.string().min(1, 'La fecha del pago es requerida.'),
  payment_method: z.string().max(50, 'Máximo 50 caracteres.').optional(),
  observation: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface SalePaymentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  saleId: number
  /** Saldo pendiente de la venta — solo informativo, la validación real (el monto no puede
   * superar el saldo al crear, ni hacer que el total pagado supere el total al editar) la hace
   * siempre el servidor (ver sale-payments.md). */
  balance: number
  currency: string
  /** Si se pasa, el diálogo edita este pago (PATCH) en vez de crear uno nuevo (POST). */
  editingPayment?: SalePayment | null
}

export function SalePaymentFormDialog({
  open,
  onOpenChange,
  saleId,
  balance,
  currency,
  editingPayment,
}: SalePaymentFormDialogProps) {
  const { isSubmitting, error, fieldErrors, create, update, reset } = useSalePaymentFormStore()
  const isEdit = Boolean(editingPayment)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { amount: 0, payment_date: new Date().toISOString().slice(0, 10), payment_method: '', observation: '' },
  })

  useEffect(() => {
    if (!open) return
    if (editingPayment) {
      form.reset({
        amount: editingPayment.amount,
        payment_date: editingPayment.paymentDate.slice(0, 10),
        payment_method: editingPayment.paymentMethod ?? '',
        observation: editingPayment.observation ?? '',
      })
    } else {
      form.reset({ amount: 0, payment_date: new Date().toISOString().slice(0, 10), payment_method: '', observation: '' })
    }
  }, [open, editingPayment])

  useEffect(() => () => reset(), [])

  const onSubmit = async (values: FormValues) => {
    const payload = {
      amount: values.amount,
      payment_date: values.payment_date,
      payment_method: values.payment_method || undefined,
      observation: values.observation || undefined,
    }

    const ok = editingPayment
      ? await update(editingPayment.id, saleId, payload)
      : await create({ sale_id: saleId, ...payload })

    if (ok) {
      toastSuccess(editingPayment ? 'Pago actualizado' : 'Pago registrado', `${currency} ${values.amount.toFixed(2)}`)
      onOpenChange(false)
    } else {
      applyApiErrors(form, fieldErrors)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="size-4" />
            {isEdit ? 'Editar pago' : 'Registrar pago'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'El monto editado no puede hacer que el total pagado supere el total de la venta.'
              : `Saldo pendiente actual: ${currency} ${balance.toFixed(2)}.`}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Monto <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        autoFocus
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Fecha <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de pago</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Yape, Transferencia, Efectivo" maxLength={50} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observación</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Observaciones opcionales" className="resize-none" rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <AlertError
                title={isEdit ? 'Error al actualizar' : 'Error al registrar'}
                message={error}
                apiError={fieldErrors ? { errors: fieldErrors } : undefined}
              />
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="min-w-28">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Guardando...
                  </>
                ) : isEdit ? (
                  'Guardar'
                ) : (
                  'Registrar'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
