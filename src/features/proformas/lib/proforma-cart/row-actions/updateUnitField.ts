// src/features/proformas/lib/proforma-cart/row-actions/updateUnitField.ts
import type { ProformaDetail } from '@/features/proforma-details'
import { applyCartItemFieldChange } from './applyCartItemFieldChange'

interface UpdateUnitFieldDeps {
  value: string
  /** Fila ya guardada que se está editando (columna "Unidad" de esa fila). */
  savedRow?: ProformaDetail
  /** tempId de un producto pendiente (columna "Unidad" de esa fila). */
  pendingTempId?: string
}

/** Cambia la columna "Unidad" de un producto del carrito — nuevo, guardado o pendiente. */
export function updateUnitField(deps: UpdateUnitFieldDeps) {
  applyCartItemFieldChange({ field: 'unit', ...deps })
}
