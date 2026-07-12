// src/features/proformas/lib/proforma-cart/row-actions/getSavedItemValue.ts
import type { ProformaDetail } from '@/features/proforma-details'
import type { CartItem } from '../types'

/** Valor actual de una fila ya guardada: si tiene una edición en curso (en `useCartDraftsStore`),
 * esa; si no, el valor tal cual vino del backend. */
export function getSavedItemValue(row: ProformaDetail, savedItemEdits: Record<number, CartItem>): CartItem {
  return savedItemEdits[row.id] ?? {
    productServiceId: row.productServiceId,
    description: row.description,
    unit: row.unit ?? '',
    quantity: row.quantity,
    unitPrice: row.unitPrice,
    tax: row.tax ?? 0,
  }
}
