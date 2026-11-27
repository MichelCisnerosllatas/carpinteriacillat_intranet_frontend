import { create } from 'zustand'

type SearchState = {
  open: boolean
  /** true cuando se navegó desde el buscador: el sidebar lleva el módulo activo arriba de todo. */
  revealActive: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
  setRevealActive: (revealActive: boolean) => void
}

export const useSearchStore = create<SearchState>()((set) => ({
  open: false,
  revealActive: false,
  setOpen: (open) => set({ open }),
  toggle: () => set((state) => ({ open: !state.open })),
  setRevealActive: (revealActive) => set({ revealActive }),
}))
