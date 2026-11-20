// src/features/sales/lib/sale-pos/calculate.ts
import type { CartLine, TaxConfig } from './types'

/** Redondea a 2 decimales igual que PHP `round($x, 2)` (el EPSILON evita que 1.005 quede 1.00). */
export const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

export type LineAmounts = {
  /** cantidad × precio, redondeado. */
  gross: number
  discount: number
  /** Base imponible de la línea = gross − discount. */
  subtotal: number
  tax: number
  total: number
}

/**
 * Calcula una línea EXACTAMENTE como el backend (contrato §1, SaleDetailServices::calculateLine).
 * Se redondea por línea y después se suma: si se redondeara solo el total final, el resumen de la
 * pantalla podría diferir en céntimos de lo que termina guardando el servidor.
 */
export function calculateLine(line: CartLine, taxConfig: TaxConfig): LineAmounts {
  const gross = round2(line.quantity * line.unitPrice)
  const discount = round2(line.discount || 0)
  const subtotal = round2(gross - discount)
  const tax = taxConfig.taxed ? round2((subtotal * taxConfig.rate) / 100) : 0
  return { gross, discount, subtotal, tax, total: round2(subtotal + tax) }
}

export type CartTotals = {
  /** Suma de cantidad × precio (antes de descuentos). */
  gross: number
  discountTotal: number
  /** Base imponible total (lo que el backend guarda como `subtotal`). */
  subtotal: number
  tax: number
  total: number
}

/** Totales de cabecera = suma de las líneas ya redondeadas (igual que el backend). */
export function calculateTotals(lines: CartLine[], taxConfig: TaxConfig): CartTotals {
  const totals = lines.reduce(
    (acc, line) => {
      const amounts = calculateLine(line, taxConfig)
      acc.gross += amounts.gross
      acc.discountTotal += amounts.discount
      acc.subtotal += amounts.subtotal
      acc.tax += amounts.tax
      acc.total += amounts.total
      return acc
    },
    { gross: 0, discountTotal: 0, subtotal: 0, tax: 0, total: 0 }
  )
  // Se vuelve a redondear porque sumar decimales en JS deja "basura" (0.1 + 0.2 = 0.30000000000000004).
  return {
    gross: round2(totals.gross),
    discountTotal: round2(totals.discountTotal),
    subtotal: round2(totals.subtotal),
    tax: round2(totals.tax),
    total: round2(totals.total),
  }
}

/** Correlativo con el formato SUNAT de 8 dígitos: 124 → "00000124". */
export function formatCorrelative(correlative: number): string {
  return String(correlative).padStart(8, '0')
}

/** Formato de dinero para la pantalla: "S/ 1,250.00" o "$ 30.00". */
export function formatMoney(value: number, currency: string): string {
  const symbol = currency === 'USD' ? '$' : 'S/'
  const amount = value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `${symbol} ${amount}`
}

/** Fecha de HOY en formato Y-m-d usando la hora local (no UTC: con `toISOString()` una venta
 * hecha de noche en Lima saldría con la fecha de mañana). */
export function todayLocal(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}
