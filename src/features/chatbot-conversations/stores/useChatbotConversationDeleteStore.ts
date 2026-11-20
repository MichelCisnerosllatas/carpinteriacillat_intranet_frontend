import { create } from 'zustand'
import { chatbotConversationsService } from '../services/chatbot-conversations.service'
import { useChatbotConversationListStore } from './useChatbotConversationListStore'

type State = {
  loadingId: number | null
  error: string | null
}

type Action = {
  deleteItem: (id: number) => Promise<boolean>
  bulkDeleteItems: (ids: number[]) => Promise<boolean>
}

export const useChatbotConversationDeleteStore = create<State & Action>((set) => ({
  loadingId: null, error: null,

  deleteItem: async (id) => {
    set({ loadingId: id, error: null })
    try {
      await chatbotConversationsService.delete(id)
      if (useChatbotConversationListStore.getState().hasLoaded) await useChatbotConversationListStore.getState().load()
      return true
    } catch (error: any) {
      set({ error: error?.response?.data?.message ?? 'No se pudo eliminar la conversación.' })
      return false
    } finally {
      set({ loadingId: null })
    }
  },

  bulkDeleteItems: async (ids) => {
    set({ error: null })
    try {
      await Promise.all(ids.map((id) => chatbotConversationsService.delete(id)))
      await useChatbotConversationListStore.getState().load()
      return true
    } catch (error: any) {
      await useChatbotConversationListStore.getState().load()
      set({ error: error?.response?.data?.message ?? 'No se pudieron eliminar todas las conversaciones.' })
      return false
    }
  },
}))
