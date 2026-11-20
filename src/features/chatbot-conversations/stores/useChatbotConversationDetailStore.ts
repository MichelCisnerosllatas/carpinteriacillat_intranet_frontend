import { create } from 'zustand'
import { chatbotConversationsService } from '../services/chatbot-conversations.service'
import { mapChatbotConversationDetailFromApi } from './useChatbotConversationListStore'
import type { ChatbotConversationDetail } from '../data/schema'
import type { ChatbotConversationStatus } from '../model/chatbotconversationget.dto'

type State = {
  isLoading: boolean
  isError: boolean
  message: string | null
  item: ChatbotConversationDetail | null
}

type Action = {
  load: (id: number) => Promise<boolean>
  /** Actualiza el estado en memoria después de un PATCH exitoso (sin volver a pedir todo el hilo). */
  setStatus: (status: ChatbotConversationStatus) => void
  reset: () => void
}

/** Detalle de una conversación con su hilo completo de mensajes. */
export const useChatbotConversationDetailStore = create<State & Action>((set, get) => ({
  isLoading: false, isError: false, message: null, item: null,

  load: async (id) => {
    set({ isLoading: true, isError: false, message: null })
    try {
      const res = await chatbotConversationsService.getById(id)
      if (!res.success || !res.data) throw new Error(res.message)
      set({ isLoading: false, item: mapChatbotConversationDetailFromApi(res.data) })
      return true
    } catch (error: any) {
      set({ isLoading: false, isError: true, message: error?.response?.data?.message ?? error?.message ?? 'No se pudo cargar la conversación.' })
      return false
    }
  },

  setStatus: (status) => {
    const item = get().item
    if (item) set({ item: { ...item, status } })
  },

  reset: () => set({ isLoading: false, isError: false, message: null, item: null }),
}))
