// src/features/sales/hooks/useSaleCart.ts
'use client'

import { useEffect, useState } from 'react'
import { useProductServiceSelectStore } from '@/features/products-services'
import { useSaleDetailListStore } from '@/features/sale-details'
import { usePendingCartItemsStore } from '../stores/usePendingCartItemsStore'
import { useCartDraftsStore } from '../stores/useCartDraftsStore'
import { calculateCartTotals, type CartTaxPreview } from '../lib/sale-cart'

interface UseSaleCartOptions {
  saleId: number | null
  onCountChange?: (count: number) => void
  /** Si ya se sabe si la venta va a gravar IGV (ver header-section.tsx), se usa para proyectar
   * el impuesto de los pendientes en `totals` en vez de dejarlo en "no sé todavía". */
  taxPreview?: CartTaxPreview
}

/**
 * Solo el ESTADO del carrito (qué hay guardado, qué fila está cargando) y los efectos que lo
 * mantienen sincronizado con el backend. Este hook NO decide qué pasa al agregar, editar o
 * eliminar un producto — esa lógica vive en `lib/sale-cart/cart-actions.ts`. El componente llama
 * a esas funciones directamente — este hook solo expone el estado que leen. Análogo 1:1 a
 * `useProformaCart` (proformas), sin `tax`.
 *
 * - `savedItems`: líneas ya guardadas en el backend (store de `sale-details`).
 * - `pendingCartItems`: productos agregados ANTES de que la venta tuviera id — viven en su
 *   propio store, `usePendingCartItemsStore`.
 * - `newItem` / `savedItemEdits`: los "borradores" en pantalla (formulario de agregar, y
 *   ediciones en curso de filas ya guardadas) — viven en `useCartDraftsStore`.
 */
export function useSaleCart({ saleId, onCountChange, taxPreview }: UseSaleCartOptions) {
  const { items: savedItems, isFetching, loadBySale, reset: resetSavedItems } = useSaleDetailListStore()
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
    if (saleId) void loadBySale(saleId)
    return () => resetSavedItems()
  }, [saleId])

  // Solo al desmontar el formulario por completo (deps []). La subida de `pendingCartItems` al
  // crear la venta ya NO ocurre acá — la maneja `submitSaleHeader`, que llama a
  // `uploadPendingItems` y espera a que termine ANTES de cerrar el modal y navegar. Este cleanup
  // solo limpia el store si el usuario cierra el formulario sin llegar a registrar nada.
  useEffect(() => {
    return () => usePendingCartItemsStore.getState().clearPendingCartItems()
  }, [])

  const totals = calculateCartTotals(savedItems, pendingCartItems, taxPreview)

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
