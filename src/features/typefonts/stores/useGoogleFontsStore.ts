import { create } from 'zustand'
import { googleFontsService, type GoogleFontItem } from '../services/google-fonts.service'

type State = {
  fonts: GoogleFontItem[]
  isLoading: boolean
  isError: boolean
  errorMessage: string | null
}

type Action = {
  load: () => Promise<void>
}

export const useGoogleFontsStore = create<State & Action>((set, get) => ({
  fonts: [],
  isLoading: false,
  isError: false,
  errorMessage: null,

  load: async () => {
    if (get().isLoading || get().fonts.length > 0) return
    set({ isLoading: true, isError: false, errorMessage: null })
    try {
      const fonts = await googleFontsService.getList()
      set({ fonts, isLoading: false })
    } catch (error: any) {
      set({ isError: true, isLoading: false, errorMessage: error?.message ?? 'Error al cargar tipografías.' })
    }
  },
}))
