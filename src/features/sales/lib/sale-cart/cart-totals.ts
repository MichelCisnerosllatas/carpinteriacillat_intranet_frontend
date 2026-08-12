// src/features/sales/lib/sale-cart/cart-totals.ts
import type { SaleDetail } from '@/features/sale-details'
import type { CartItem, CartTaxPreview, CartTotals } from './types'

/**
 * Suma lo ya guardado en el backend (calculado por el servidor, incluyendo su `tax` real) + lo
 * que todavía está pendiente de subir. El `tax` de lo pendiente lo calcula siempre el servidor
 * al guardar (nunca el cliente) — pero si ya se sabe si la venta va a gravar IGV y a qué tasa
 * (`taxPreview`, resuelto en header-section.tsx a partir del campo "¿Grava IGV?" +
 * `sale-settings`), se puede proyectar ese impuesto con confianza en vez de dejarlo en 0 con un
 * asterisco de "no sé todavía" — que era confuso incluso cuando la respuesta ya se conocía (ej.
 * "no grava IGV", donde el total real siempre iba a ser el subtotal tal cual).
 */
export function calculateCartTotals(
  savedItems: SaleDetail[],
  pendingItems: CartItem[],
  taxPreview?: CartTaxPreview
): CartTotals {
  const subtotalSaved = savedItems.reduce((acc, d) => acc + d.subtotal, 0)
  const taxSaved = savedItems.reduce((acc, d) => acc + (d.tax ?? 0), 0)
  const totalSaved = savedItems.reduce((acc, d) => acc + d.total, 0)

  const subtotalPending = pendingItems.reduce((acc, d) => acc + d.quantity * d.unitPrice, 0)

  // Sin `taxPreview`, o todavía no se sabe (`willBeTaxed: null`) — mismo comportamiento de
  // siempre: no se proyecta nada, y se avisa que falta calcular.
  if (!taxPreview || taxPreview.willBeTaxed == null) {
    return {
      subtotal: subtotalSaved + subtotalPending,
      tax: taxSaved,
      total: totalSaved + subtotalPending,
      hasPendingTax: pendingItems.length > 0,
    }
  }

  const pendingTax = taxPreview.willBeTaxed
    ? Math.round(subtotalPending * (taxPreview.rate / 100) * 100) / 100
    : 0

  return {
    subtotal: subtotalSaved + subtotalPending,
    tax: taxSaved + pendingTax,
    total: totalSaved + subtotalPending + pendingTax,
    // Ya se sabe la respuesta (grava o no) — el total ya es el definitivo, sin asteriscos.
    hasPendingTax: false,
  }
}
