// src/features/sales/stores/usePendingCartItemsStore.ts
import { create } from 'zustand'
import type { CartItem, PendingCartItem } from '../lib/sale-cart/types'

let nextTempId = 0

type State = {
  /** Productos agregados ANTES de que la venta tenga id — la lista temporal del carrito. Se
   * recorre uno por uno para registrarlos en cuanto la venta obtiene su id real. */
  pendingCartItems: PendingCartItem[]
  /** tempId del producto que se está subiendo al backend ahora mismo (o null si ninguno). */
  uploadingTempId: string | null
}

type Action = {
  addPendingCartItem: (item: CartItem) => void
  updatePendingCartItem: (tempId: string, changes: Partial<CartItem>) => void
  removePendingCartItem: (tempId: string) => void
  setUploadingTempId: (tempId: string | null) => void
  /** Vacía la lista — se llama al cerrar/cancelar el formulario de creación. */
  clearPendingCartItems: () => void
}

export const usePendingCartItemsStore = create<State & Action>((set) => ({
  pendingCartItems: [],
  uploadingTempId: null,

  addPendingCartItem: (item) => set((state) => ({
    pendingCartItems: [...state.pendingCartItems, { ...item, tempId: `pending-${++nextTempId}` }],
  })),

  updatePendingCartItem: (tempId, changes) => set((state) => ({
    pendingCartItems: state.pendingCartItems.map((p) => (p.tempId === tempId ? { ...p, ...changes } : p)),
  })),

  removePendingCartItem: (tempId) => set((state) => ({
    pendingCartItems: state.pendingCartItems.filter((p) => p.tempId !== tempId),
  })),

  setUploadingTempId: (tempId) => set({ uploadingTempId: tempId }),

  clearPendingCartItems: () => set({ pendingCartItems: [], uploadingTempId: null }),
}))
