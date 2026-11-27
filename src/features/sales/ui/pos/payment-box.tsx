// src/features/sales/ui/pos/payment-box.tsx
'use client'

import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { cn } from '@/shared/lib/utils'
import { SALE_PAYMENT_METHODS } from '@/features/sale-payments'
import { useSalePosStore } from '../../stores/useSalePosStore'
import { formatMoney, type PaymentMode } from '../../lib/sale-pos'
import { FieldError } from './field-error'

const PAYMENT_MODES: { value: PaymentMode; label: string }[] = [
  { value: 'full', label: 'Pago completo' },
  { value: 'partial', label: 'Adelanto' },
  { value: 'none', label: 'Sin pago (crédito)' },
]

interface PaymentBoxProps {
  total: number
  currency: string
  paidNow: number
  balance: number
  errorFor: (key: string, prefix?: boolean) => string | undefined
}

/** Cobro al emitir: condición y método en una sola fila; el monto solo se pide en "Adelanto". */
export function PaymentBox({ total, currency, paidNow, balance, errorFor }: PaymentBoxProps) {
  const {
    paymentMode,
    paymentAmount,
    paymentMethod,
    setPaymentMode,
    setPaymentAmount,
    setPaymentMethod,
  } = useSalePosStore()

  const handleMode = (mode: PaymentMode) => {
    setPaymentMode(mode)
    // Al pasar a "Adelanto" se propone la mitad del total como punto de partida editable.
    if (mode === 'partial' && paymentAmount <= 0) setPaymentAmount(Math.round(total * 50) / 100)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex min-w-0 flex-col gap-1.5">
          <Label className="text-xs">Condición</Label>
          <Select value={paymentMode} onValueChange={(v) => handleMode(v as PaymentMode)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_MODES.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex min-w-0 flex-col gap-1.5">
          <Label className="text-xs">Método</Label>
          <Select
            value={paymentMethod ?? ''}
            onValueChange={setPaymentMethod}
            disabled={paymentMode === 'none'}
          >
            <SelectTrigger
              className="w-full"
              aria-invalid={Boolean(errorFor('payment_method')) || undefined}
            >
              <SelectValue placeholder="Elegir..." />
            </SelectTrigger>
            <SelectContent>
              {SALE_PAYMENT_METHODS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <FieldError message={errorFor('payment_method')} />

      {paymentMode === 'partial' && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pos-payment-amount" className="text-xs">
            Monto del adelanto
          </Label>
          <Input
            id="pos-payment-amount"
            type="number"
            step="0.01"
            min="0"
            value={paymentAmount}
            className="tabular-nums"
            aria-invalid={Boolean(errorFor('payments', true)) || undefined}
            onFocus={(e) => e.target.select()}
            onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
          />
        </div>
      )}
      <FieldError message={errorFor('payments', true)} />

      {/* En "Pago completo" no hace falta repetir números: paga el total y no queda saldo. */}
      {paymentMode !== 'full' && (
        <div className="bg-muted/40 flex flex-col gap-1 rounded-md px-3 py-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Paga ahora</span>
            <span className="font-medium tabular-nums">{formatMoney(paidNow, currency)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Saldo pendiente</span>
            <span
              className={cn(
                'font-semibold tabular-nums',
                balance > 0
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-teal-600 dark:text-teal-400'
              )}
            >
              {formatMoney(balance, currency)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
