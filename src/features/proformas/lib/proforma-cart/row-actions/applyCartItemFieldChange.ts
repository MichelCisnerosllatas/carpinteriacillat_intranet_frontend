// src/features/proformas/lib/proforma-cart/row-actions/applyCartItemFieldChange.ts
import type { ProformaDetail } from '@/features/proforma-details'
import { useCartDraftsStore } from '../../../stores/useCartDraftsStore'
import { usePendingCartItemsStore } from '../../../stores/usePendingCartItemsStore'
import { getSavedItemValue } from './getSavedItemValue'
import type { CartItem } from '../types'

interface ApplyCartItemFieldChangeDeps {
  field: keyof CartItem
  value: CartItem[keyof CartItem]
  savedRow?: ProformaDetail
  pendingTempId?: string
}

/**
 * Helper interno compartido por los 4 `updateXField.ts` (uno por columna: descripción, unidad,
 * cantidad, precio unitario) — el branching por nuevo/guardado/pendiente es igual para las 4
 * columnas, solo cambia qué campo se escribe. No se exporta en el barril: cada columna tiene su
 * propio archivo público (`updateDescriptionField`, `updateUnitField`, etc.), este es solo la
 * lógica compartida entre ellos.
 */
export function applyCartItemFieldChange(deps: ApplyCartItemFieldChangeDeps) {
  const { field, value, savedRow, pendingTempId } = deps

  // GUARDADO
  if (savedRow) {
    const { savedItemEdits, setSavedItemEdit } = useCartDraftsStore.getState()
    const current = getSavedItemValue(savedRow, savedItemEdits)
    setSavedItemEdit(savedRow.id, { ...current, [field]: value })
    return
  }

  // PENDIENTE
  if (pendingTempId) {
    usePendingCartItemsStore.getState().updatePendingCartItem(pendingTempId, { [field]: value })
    return
  }

  // NUEVO
  const { newItem, setNewItem } = useCartDraftsStore.getState()
  setNewItem({ ...newItem, [field]: value })
}
