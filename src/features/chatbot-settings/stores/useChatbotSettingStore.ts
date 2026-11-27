import { create } from 'zustand'
import { chatbotSettingService } from '../services/chatbotsetting.service'
import type { ChatbotSettingApiItem, ChatbotSettingUpdateRequestDto } from '../model/chatbotsetting.dto'

type State = {
  hasLoaded: boolean
  isLoading: boolean
  isSubmitting: boolean
  isError: boolean
  error: string | null
  fieldErrors: Record<string, string[]> | null
  setting: ChatbotSettingApiItem | null
}

type Action = {
  get: () => Promise<boolean>
  update: (data: ChatbotSettingUpdateRequestDto) => Promise<boolean>
  reset: () => void
}

/** Configuración (singleton) del chatbot — mismo patrón que `useFooterSettingStore`. */
export const useChatbotSettingStore = create<State & Action>((set) => ({
  hasLoaded: false, isLoading: false, isSubmitting: false, isError: false, error: null, fieldErrors: null, setting: null,

  get: async () => {
    set({ isLoading: true, isError: false, error: null })
    try {
      const res = await chatbotSettingService.get()
      if (!res.success) throw new Error(res.message)
      set({ isLoading: false, hasLoaded: true, setting: res.data })
      return true
    } catch (error: any) {
      set({
        isLoading: false,
        isError: true,
        error: error?.response?.data?.message ?? error?.message ?? 'Error al cargar la configuración del chatbot.',
      })
      return false
    }
  },

  update: async (data) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const res = await chatbotSettingService.update(data)
      if (!res.success) {
        set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null })
        return false
      }
      set({ isSubmitting: false, setting: res.data })
      return true
    } catch (error: any) {
      set({
        isSubmitting: false,
        error: error?.response?.data?.message ?? error?.message ?? 'Error al actualizar la configuración del chatbot.',
        fieldErrors: error?.response?.data?.errors ?? null,
      })
      return false
    }
  },

  reset: () => set({ hasLoaded: false, isLoading: false, isSubmitting: false, isError: false, error: null, fieldErrors: null, setting: null }),
}))
