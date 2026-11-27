import { create } from 'zustand'
import { chatbotOptionsService } from '../services/chatbot-options.service'
import { useChatbotOptionListStore } from './useChatbotOptionListStore'

type State = {
  isSubmitting: boolean
  error: string | null
}

type Action = {
  /** Manda los ids en el nuevo orden; la API deja 1, 2, 3... */
  confirm: (ids: number[]) => Promise<boolean>
}

export const useChatbotOptionReorderStore = create<State & Action>((set) => ({
  isSubmitting: false, error: null,

  confirm: async (ids) => {
    set({ isSubmitting: true, error: null })
    try {
      const res = await chatbotOptionsService.reorder({ ids })
      if (!res.success) { set({ isSubmitting: false, error: res.message }); return false }
      useChatbotOptionListStore.getState().setForceReload(true)
      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      set({ isSubmitting: false, error: error?.response?.data?.message ?? error?.message ?? 'Error al guardar el orden.' })
      return false
    }
  },
}))
