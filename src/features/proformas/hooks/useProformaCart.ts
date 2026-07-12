// src/features/proformas/hooks/useProformaCart.ts
'use client'

import { useEffect, useState } from 'react'
import { useProductServiceSelectStore } from '@/features/products-services'
import { useProformaDetailListStore } from '@/features/proforma-details'
import { usePendingCartItemsStore } from '../stores/usePendingCartItemsStore'
import { useCartDraftsStore } from '../stores/useCartDraftsStore'
import { calculateCartTotals, uploadPendingItems } from '../lib/proforma-cart'

interface UseProformaCartOptions {
  proformaId: number | null
  onCountChange?: (count: number) => void
}

/**
 * Solo el ESTADO del carrito (qué hay guardado, qué fila está cargando) y los efectos que lo
 * mantienen sincronizado con el backend. Este hook NO decide qué pasa al agregar, editar o
 * eliminar un producto — esa lógica vive, una función por archivo, en
 * `lib/proforma-cart/row-actions/` (`addProductToCart.ts`, `updateDescriptionField.ts`,
 * `updateUnitField.ts`, `updateQuantityField.ts`, `updateUnitPriceField.ts`,
 * `autofillCartItem.ts`, `saveEditedCartItem.ts`, `removeProductFromCart.ts`).
 * El componente llama a esas funciones directamente — este hook solo expone el estado que leen.
 *
 * - `savedItems`: productos ya guardados en el backend (store de `proforma-details`).
 * - `pendingCartItems`: productos agregados ANTES de que la proforma tuviera id — viven en su
 *   propio store, `usePendingCartItemsStore`.
 * - `newItem` / `savedItemEdits`: los "borradores" en pantalla (formulario de agregar, y
 *   ediciones en curso de filas ya guardadas) — viven en `useCartDraftsStore`.
 */
export function useProformaCart({ proformaId, onCountChange }: UseProformaCartOptions) {
  const { items: savedItems, isFetching, loadByProforma, reset: resetSavedItems } = useProformaDetailListStore()
  const { options: productServiceOptions, load: loadProductServices } = useProductServiceSelectStore()
  const { pendingCartItems, uploadingTempId } = usePendingCartItemsStore()
  const { newItem, savedItemEdits } = useCartDraftsStore()

  const [savingItemId, setSavingItemId] = useState<number | null>(null)
  const [isAddingItem, setIsAddingItem] = useState(false)

  useEffect(() => { void loadProductServices() }, [])

  useEffect(() => {
    onCountChange?.(savedItems.length + pendingCartItems.length)
  }, [savedItems.length, pendingCartItems.length])

  useEffect(() => {
    if (proformaId) void loadByProforma(proformaId)
    return () => resetSavedItems()
  }, [proformaId])

  // Solo al desmontar el formulario por completo (deps [] — NO en cada cambio de proformaId).
  // Si estuviera atado a `proformaId`, este cleanup correría justo cuando proformaId pasa de
  // null a un id real al registrar, borrando `pendingCartItems` antes de que el efecto de abajo
  // alcance a leerlos para subirlos — ese fue el bug que hacía que no se guardara nada.
  useEffect(() => {
    return () => usePendingCartItemsStore.getState().clearPendingCartItems()
  }, [])

  // Automático (no lo llama ningún botón): en cuanto llega el proformaId real, delega en
  // `uploadPendingItems` (lib/proforma-cart/uploadPendingItems.ts) la subida de los productos
  // guardados en `usePendingCartItemsStore`.
  useEffect(() => {
    if (!proformaId || usePendingCartItemsStore.getState().pendingCartItems.length === 0) return
    void uploadPendingItems({ proformaId })
  }, [proformaId])

  const totals = calculateCartTotals(savedItems, pendingCartItems)

  return {
    savedItems,
    isFetching,
    productServiceOptions,
    newItem,
    pendingCartItems,
    uploadingTempId,
    savedItemEdits,
    savingItemId,
    setSavingItemId,
    isAddingItem,
    setIsAddingItem,
    totals,
    hasItems: savedItems.length > 0 || pendingCartItems.length > 0,
  }
}
