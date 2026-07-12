// src/features/proformas/lib/proforma-cart/row-actions/updateDescriptionField.ts
import type { ProformaDetail } from '@/features/proforma-details'
import { applyCartItemFieldChange } from './applyCartItemFieldChange'

interface UpdateDescriptionFieldDeps {
  value: string
  /** Fila ya guardada que se está editando (columna "Descripción" de esa fila). */
  savedRow?: ProformaDetail
  /** tempId de un producto pendiente (columna "Descripción" de esa fila). */
  pendingTempId?: string
}

/** Cambia la columna "Descripción" de un producto del carrito — nuevo, guardado o pendiente. */
export function updateDescriptionField(deps: UpdateDescriptionFieldDeps) {
  applyCartItemFieldChange({ field: 'description', ...deps })
}
