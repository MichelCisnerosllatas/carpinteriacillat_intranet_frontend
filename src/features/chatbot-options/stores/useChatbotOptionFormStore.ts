import { create } from 'zustand'
import { chatbotOptionsService } from '../services/chatbot-options.service'
import type { ChatbotOptionPostRequestDto } from '../model/chatbotoptionpost.dto'
import type { ChatbotOptionPutRequestDto } from '../model/chatbotoptionput.dto'
import { useChatbotOptionListStore } from './useChatbotOptionListStore'

type State = {
  isSubmitting: boolean
  error: string | null
  fieldErrors: Record<string, string[]> | null
}

type Action = {
  create: (params: ChatbotOptionPostRequestDto) => Promise<boolean>
  update: (id: number, params: ChatbotOptionPutRequestDto) => Promise<boolean>
  reset: () => void
}

export const useChatbotOptionFormStore = create<State & Action>((set) => ({
  isSubmitting: false, error: null, fieldErrors: null,

  create: async (params) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const res = await chatbotOptionsService.post(params)
      if (!res.success) { set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null }); return false }
      useChatbotOptionListStore.getState().setForceReload(true)
      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      set({ isSubmitting: false, error: error?.response?.data?.message ?? error?.message ?? 'Error al crear.', fieldErrors: error?.response?.data?.errors ?? null })
      return false
    }
  },

  update: async (id, params) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const res = await chatbotOptionsService.put(id, params)
      if (!res.success) { set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null }); return false }
      useChatbotOptionListStore.getState().setForceReload(true)
      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      set({ isSubmitting: false, error: error?.response?.data?.message ?? error?.message ?? 'Error al guardar.', fieldErrors: error?.response?.data?.errors ?? null })
      return false
    }
  },

  reset: () => set({ isSubmitting: false, error: null, fieldErrors: null }),
}))
