// src/features/sales/ui/form/pending-payments-card.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Wallet, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { usePendingPaymentsStore } from '../../stores/usePendingPaymentsStore'
import { formatSaleCurrency } from '../../data/data'

const draftSchema = z.object({
  amount: z.number({ error: 'Ingrese un monto válido.' }).min(0.01, 'El monto debe ser mayor a 0.'),
  payment_date: z.string().min(1, 'La fecha del pago es requerida.'),
  payment_method: z.string().max(50, 'Máximo 50 caracteres.').optional(),
  observation: z.string().optional(),
})
type DraftFormValues = z.infer<typeof draftSchema>

const emptyDraft: DraftFormValues = {
  amount: 0,
  payment_date: new Date().toISOString().slice(0, 10),
  payment_method: '',
  observation: '',
}

interface PendingPaymentsCardProps {
  currency: string
}

/**
 * Cobros/adelantos ANTES de que la venta exista — el usuario no necesita saber que "hay que
 * guardar la venta primero": puede cargar uno o varios pagos ya mismo (`usePendingPaymentsStore`,
 * mismo patrón que `usePendingCartItemsStore` para el carrito), y se suben solos apenas la venta
 * obtiene su id real (`uploadPendingPayments`, ver lib/sale-form/submit-sale-header.ts).
 *
 * A propósito NO es una card — este es el módulo de Ventas, no el de Cobros: quien entra acá
 * quiere registrar la venta lo más rápido posible, no lo primero que va a querer ver es cobrar.
 * Por eso el registro de un adelanto es solo un enlace de una línea ("puedes agregar un
 * adelanto"), del mismo tamaño que cualquier texto de ayuda — nunca compite visualmente con el
 * Carrito. Solo se usa en creación — en edición, la venta ya existe, así que se reemplaza por el
 * `SalePaymentsSection` real (ver sale-form.tsx).
 */
export function PendingPaymentsCard({ currency }: PendingPaymentsCardProps) {
  const { pendingPayments, removePendingPayment } = usePendingPaymentsStore()
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <Button
        type="button"
        variant="link"
        className="h-auto gap-1 p-0 text-xs"
        onClick={() => setDialogOpen(true)}
      >
        <Plus className="size-3" />
        Agregar un adelanto (opcional)
      </Button>

      {pendingPayments.map((p) => (
        <Tooltip key={p.tempId}>
          <TooltipTrigger asChild>
            <span className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs">
              <Wallet className="size-3" />
              {formatSaleCurrency(p.amount, currency)}
              <button
                type="button"
                onClick={() => removePendingPayment(p.tempId)}
                className="hover:text-destructive"
              >
                <X className="size-3" />
              </button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            Adelanto del {p.paymentDate}
            {p.paymentMethod && ` · ${p.paymentMethod}`} — se guarda junto con la venta.
          </TooltipContent>
        </Tooltip>
      ))}

      <PendingPaymentDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}

function PendingPaymentDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { addPendingPayment } = usePendingPaymentsStore()

  const form = useForm<DraftFormValues>({
    resolver: zodResolver(draftSchema),
    defaultValues: emptyDraft,
  })

  const onSubmit = (values: DraftFormValues) => {
    addPendingPayment({
      amount: values.amount,
      paymentDate: values.payment_date,
      paymentMethod: values.payment_method ?? '',
      observation: values.observation ?? '',
    })
    form.reset(emptyDraft)
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) form.reset(emptyDraft)
        onOpenChange(next)
      }}
    >
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="size-4" />
            Registrar pago
          </DialogTitle>
          <DialogDescription>
            Se guarda junto con la venta apenas la registres — todavía no se valida contra el
            saldo (recién se conoce cuando la venta exista).
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Agregar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
