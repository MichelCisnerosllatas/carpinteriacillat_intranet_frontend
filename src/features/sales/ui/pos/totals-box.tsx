// src/features/sales/ui/pos/totals-box.tsx
import Link from 'next/link'
import { formatMoney, type CartTotals, type TaxConfig } from '../../lib/sale-pos'

interface TotalsBoxProps {
  totals: CartTotals
  currency: string
  taxConfig: TaxConfig
  /** Al editar el IGV ya quedó fijo en la venta: no se ofrece el link a la configuración. */
  isEdit: boolean
}

/** Totales en vivo, calculados igual que el backend (ver lib/sale-pos/calculate.ts). */
export function TotalsBox({ totals, currency, taxConfig, isEdit }: TotalsBoxProps) {
  return (
    <div className="flex flex-col gap-1 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="tabular-nums">{formatMoney(totals.gross, currency)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Descuentos</span>
        <span className="tabular-nums">
          {totals.discountTotal > 0 ? '− ' : ''}
          {formatMoney(totals.discountTotal, currency)}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">
          {taxConfig.taxed ? `IGV ${taxConfig.rate}%` : 'IGV (no aplica)'}
        </span>
        <span className="tabular-nums">{formatMoney(totals.tax, currency)}</span>
      </div>
      <div className="mt-1 flex items-baseline justify-between border-t pt-2">
        <span className="text-base font-semibold">TOTAL</span>
        <span className="text-2xl font-bold tabular-nums">{formatMoney(totals.total, currency)}</span>
      </div>
      {/* El IGV no se elige por venta: se decide en un solo lugar (Configuración de Ventas). */}
      <p className="text-muted-foreground text-xs">
        {isEdit ? (
          'El IGV de esta venta quedó fijado al registrarla.'
        ) : (
          <>
            El IGV se toma de{' '}
            <Link href="/sale-settings" className="text-primary hover:underline">
              Configuración de Ventas
            </Link>
            .
          </>
        )}
      </p>
    </div>
  )
}
