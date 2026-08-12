// src/features/sales/stores/useCartDraftsStore.ts
import { create } from 'zustand'
import { emptyCartItem, type CartItem } from '../lib/sale-cart/types'

type State = {
  /** El producto que se está llenando en el formulario "Agregar producto". */
  newItem: CartItem
  /** Ediciones en curso de productos YA guardados — una entrada por cada fila que se está
   * editando (aparece el ✓/✗ en esa fila mientras exista una entrada acá). */
  savedItemEdits: Record<number, CartItem>
}

type Action = {
  setNewItem: (item: CartItem) => void
  resetNewItem: () => void
  setSavedItemEdit: (rowId: number, item: CartItem) => void
  discardSavedItemEdit: (rowId: number) => void
}

export const useCartDraftsStore = create<State & Action>((set) => ({
  newItem: emptyCartItem,
  savedItemEdits: {},

  setNewItem: (item) => set({ newItem: item }),

  resetNewItem: () => set({ newItem: emptyCartItem }),

  setSavedItemEdit: (rowId, item) => set((state) => ({
    savedItemEdits: { ...state.savedItemEdits, [rowId]: item },
  })),

  discardSavedItemEdit: (rowId) => set((state) => {
    const next = { ...state.savedItemEdits }
    delete next[rowId]
    return { savedItemEdits: next }
  }),
}))
