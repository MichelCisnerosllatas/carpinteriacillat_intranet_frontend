// src/features/proformas/hooks/useProformaCart.ts
'use client'

import { useEffect, useState } from 'react'
import { useProductServiceSelectStore } from '@/features/products-services'
import { useProformaDetailListStore } from '@/features/proforma-details'
import { usePendingCartItemsStore } from '../stores/usePendingCartItemsStore'
import { useCartDraftsStore } from '../stores/useCartDraftsStore'
import { calculateCartTotals } from '../lib/proforma-cart'

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

  // Solo al desmontar el formulario por completo (deps []). La subida de `pendingCartItems` al
  // crear la proforma ya NO ocurre acá — la maneja `submitProformaHeader`
  // (lib/proforma-form/submit-proforma-header/), que llama a `uploadPendingItems` y espera a que
  // termine ANTES de cerrar el modal y navegar (así el modal no se cierra con las líneas todavía
  // subiéndose en segundo plano). Este cleanup solo limpia el store si el usuario cierra el
  // formulario sin llegar a registrar nada.
  useEffect(() => {
    return () => usePendingCartItemsStore.getState().clearPendingCartItems()
  }, [])

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
