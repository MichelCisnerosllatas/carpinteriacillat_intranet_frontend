import { create } from 'zustand'
import { chatbotVisitorsService } from '../services/chatbot-visitors.service'
import { mapChatbotVisitorDetailFromApi } from './useChatbotVisitorListStore'
import type { ChatbotVisitorDetail } from '../data/schema'

type State = {
  isLoading: boolean
  isError: boolean
  message: string | null
  item: ChatbotVisitorDetail | null
}

type Action = {
  load: (id: number) => Promise<boolean>
  reset: () => void
}

export const useChatbotVisitorDetailStore = create<State & Action>((set) => ({
  isLoading: false, isError: false, message: null, item: null,

  load: async (id) => {
    set({ isLoading: true, isError: false, message: null })
    try {
      const res = await chatbotVisitorsService.getById(id)
      if (!res.success || !res.data) throw new Error(res.message)
      set({ isLoading: false, item: mapChatbotVisitorDetailFromApi(res.data) })
      return true
    } catch (error: any) {
      set({ isLoading: false, isError: true, message: error?.response?.data?.message ?? error?.message ?? 'No se pudo cargar el visitante.' })
      return false
    }
  },

  reset: () => set({ isLoading: false, isError: false, message: null, item: null }),
}))
