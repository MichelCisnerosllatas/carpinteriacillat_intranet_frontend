import { create } from 'zustand'
import { proformaTemplateTextsService } from '../services/proforma-template-texts.service'

type State = {
  isLoading: boolean
  error: string | null
}

type Action = {
  deleteItem: (id: number) => Promise<boolean>
}

export const useProformaTemplateTextDeleteStore = create<State & Action>((set) => ({
  isLoading: false,
  error: null,

  deleteItem: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await proformaTemplateTextsService.delete(id)
      return true
    } catch {
      set({ error: 'No se pudo eliminar el registro.' })
      return false
    } finally {
      set({ isLoading: false })
    }
  },
}))
