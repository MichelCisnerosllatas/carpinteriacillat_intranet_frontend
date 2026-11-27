import { create } from 'zustand'
import { sellersService } from '../services/sellers.service'
import type { Seller } from '../data/schema'

type State = {
  options: Seller[]
  isLoading: boolean
  isError: boolean
  /** true = load() ignora el caché y vuelve a pedir la lista. */
  forceReload: boolean
}

type Action = {
  setForceReload: (value: boolean) => void
  load: () => Promise<void>
}

/**
 * Vendedores para los <SellerSelect>. Mismo patrón "cargar una vez y cachear" que los demás
 * *SelectStore: la lista cambia poco y la usan varias pantallas (ventas, proformas, POS, metas,
 * dashboard), así se pide una sola vez por sesión.
 */
export const useSellerSelectStore = create<State & Action>((set, get) => ({
  options: [],
  isLoading: false,
  isError: false,
  forceReload: false,

  setForceReload: (value) => set({ forceReload: value }),

  load: async () => {
    if (!get().forceReload && (get().isLoading || get().options.length > 0)) return
    set({ isLoading: true, isError: false, forceReload: false })
    try {
      const res = await sellersService.getList()
      if (!res.success) throw new Error(res.message)
      set({
        isLoading: false,
        options: res.data.map((s) => ({
          id: s.id,
          name: s.name || s.email,
          email: s.email,
          role: s.role ?? null,
        })),
      })
    } catch {
      set({ isLoading: false, isError: true })
    }
  },
}))
