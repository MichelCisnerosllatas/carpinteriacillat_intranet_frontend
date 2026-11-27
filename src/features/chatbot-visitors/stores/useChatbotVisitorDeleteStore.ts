import { create } from 'zustand'
import { chatbotVisitorsService } from '../services/chatbot-visitors.service'
import { useChatbotVisitorListStore } from './useChatbotVisitorListStore'

type State = {
  loadingId: number | null
  error: string | null
}

type Action = {
  /** Elimina el visitante Y todas sus conversaciones (cascade en el backend). */
  deleteItem: (id: number) => Promise<boolean>
  bulkDeleteItems: (ids: number[]) => Promise<boolean>
}

export const useChatbotVisitorDeleteStore = create<State & Action>((set) => ({
  loadingId: null, error: null,

  deleteItem: async (id) => {
    set({ loadingId: id, error: null })
    try {
      await chatbotVisitorsService.delete(id)
      if (useChatbotVisitorListStore.getState().hasLoaded) await useChatbotVisitorListStore.getState().load()
      return true
    } catch (error: any) {
      set({ error: error?.response?.data?.message ?? 'No se pudo eliminar el visitante.' })
      return false
    } finally {
      set({ loadingId: null })
    }
  },

  bulkDeleteItems: async (ids) => {
    set({ error: null })
    try {
      await Promise.all(ids.map((id) => chatbotVisitorsService.delete(id)))
      await useChatbotVisitorListStore.getState().load()
      return true
    } catch (error: any) {
      await useChatbotVisitorListStore.getState().load()
      set({ error: error?.response?.data?.message ?? 'No se pudieron eliminar todos los visitantes.' })
      return false
    }
  },
}))
