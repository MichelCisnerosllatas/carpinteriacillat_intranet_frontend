// src/features/proformas/lib/proforma-cart/row-actions/updateUnitPriceField.ts
import type { ProformaDetail } from '@/features/proforma-details'
import { applyCartItemFieldChange } from './applyCartItemFieldChange'

interface UpdateUnitPriceFieldDeps {
  value: number
  /** Fila ya guardada que se está editando (columna "P. Unitario" de esa fila). */
  savedRow?: ProformaDetail
  /** tempId de un producto pendiente (columna "P. Unitario" de esa fila). */
  pendingTempId?: string
}

/** Cambia la columna "P. Unitario" de un producto del carrito — nuevo, guardado o pendiente. */
export function updateUnitPriceField(deps: UpdateUnitPriceFieldDeps) {
  applyCartItemFieldChange({ field: 'unitPrice', ...deps })
}
