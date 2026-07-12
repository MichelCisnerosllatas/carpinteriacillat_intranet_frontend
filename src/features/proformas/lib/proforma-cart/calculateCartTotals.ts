// src/features/proformas/lib/proforma-cart/calculateCartTotals.ts
import type { ProformaDetail } from '@/features/proforma-details'
import type { CartItem, CartTotals } from './types'

/** Suma lo ya guardado en el backend (calculado por el servidor) + lo que todavía está pendiente
 * de subir (calculado acá, mismo criterio: cantidad × precio unitario). */
export function calculateCartTotals(savedItems: ProformaDetail[], pendingItems: CartItem[]): CartTotals {
  const subtotalSaved = savedItems.reduce((acc, d) => acc + d.subtotal, 0)
  const taxSaved = savedItems.reduce((acc, d) => acc + (d.tax ?? 0), 0)
  const totalSaved = savedItems.reduce((acc, d) => acc + d.total, 0)

  const subtotalPending = pendingItems.reduce((acc, d) => acc + d.quantity * d.unitPrice, 0)
  const taxPending = pendingItems.reduce((acc, d) => acc + d.tax, 0)
  const totalPending = subtotalPending + taxPending

  return {
    subtotal: subtotalSaved + subtotalPending,
    tax: taxSaved + taxPending,
    total: totalSaved + totalPending,
  }
}
