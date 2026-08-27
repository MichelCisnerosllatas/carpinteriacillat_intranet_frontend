// src/features/proformas/lib/proforma-cart/row-actions/autofillCartItem.ts
import { useProductServiceSelectStore } from '@/features/products-services'
import type { ProformaDetail } from '@/features/proforma-details'
import { useCartDraftsStore } from '../../../stores/useCartDraftsStore'
import { usePendingCartItemsStore } from '../../../stores/usePendingCartItemsStore'
import { autofillFromProductService } from '../autofillFromProductService'
import { getSavedItemValue } from './getSavedItemValue'
import type { ProductServiceOption } from '../types'

interface AutofillCartItemDeps {
  productServiceId: number | null
  /** Producto/servicio ya conocido (ej. recién elegido o recién creado en el modal) — si se pasa,
   * se usa directo para autocompletar en vez de rebuscarlo en `useProductServiceSelectStore`. Es
   * necesario para el caso "crear producto rápido y agregarlo": justo después de crearlo, la
   * recarga del catálogo (`load()`) todavía no terminó, así que buscarlo por id en el caché del
   * store devolvía `undefined` y la línea quedaba con la descripción vacía. */
  productService?: ProductServiceOption
  /** Fila ya guardada que se está editando — pásala para autocompletar esa edición en curso. */
  savedRow?: ProformaDetail
  /** tempId de un producto pendiente — pásalo para autocompletar ese producto en memoria. */
  pendingTempId?: string
}

/**
 * Autocompleta descripción/unidad/precio según el producto/servicio elegido del catálogo, sin
 * importar en cuál de los 3 lugares está el producto:
 *
 * NUEVO (formulario "Agregar producto", `useCartDraftsStore.newItem`) — el caso por defecto,
 * cuando no se pasa `savedRow` ni `pendingTempId`.
 * GUARDADO (edición en curso de una fila ya persistida, `useCartDraftsStore.savedItemEdits`).
 * PENDIENTE (producto en memoria antes de registrar, `usePendingCartItemsStore.pendingCartItems`).
 */
export function autofillCartItem(deps: AutofillCartItemDeps) {
  const { productServiceId, savedRow, pendingTempId } = deps
  const picked =
    deps.productService ??
    useProductServiceSelectStore.getState().options.find((o) => o.id === productServiceId)

  // GUARDADO
  if (savedRow) {
    const { savedItemEdits, setSavedItemEdit } = useCartDraftsStore.getState()
    const current = getSavedItemValue(savedRow, savedItemEdits)
    setSavedItemEdit(savedRow.id, autofillFromProductService(current, picked, productServiceId))
    return
  }

  // PENDIENTE
  if (pendingTempId) {
    const { pendingCartItems, updatePendingCartItem } = usePendingCartItemsStore.getState()
    const current = pendingCartItems.find((p) => p.tempId === pendingTempId)
    if (!current) return
    updatePendingCartItem(pendingTempId, autofillFromProductService(current, picked, productServiceId))
    return
  }

  // NUEVO
  const { newItem, setNewItem } = useCartDraftsStore.getState()
  setNewItem(autofillFromProductService(newItem, picked, productServiceId))
}
