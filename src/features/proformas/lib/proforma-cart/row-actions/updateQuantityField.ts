// src/features/proformas/lib/proforma-cart/row-actions/updateQuantityField.ts
import type { ProformaDetail } from '@/features/proforma-details'
import { applyCartItemFieldChange } from './applyCartItemFieldChange'

interface UpdateQuantityFieldDeps {
  value: number
  /** Fila ya guardada que se está editando (columna "Cantidad" de esa fila). */
  savedRow?: ProformaDetail
  /** tempId de un producto pendiente (columna "Cantidad" de esa fila). */
  pendingTempId?: string
}

/** Cambia la columna "Cantidad" de un producto del carrito — nuevo, guardado o pendiente. */
export function updateQuantityField(deps: UpdateQuantityFieldDeps) {
  applyCartItemFieldChange({ field: 'quantity', ...deps })
}
