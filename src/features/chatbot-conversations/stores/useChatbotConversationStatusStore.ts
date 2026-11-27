import { create } from 'zustand'
import { chatbotConversationsService } from '../services/chatbot-conversations.service'
import { useChatbotConversationListStore } from './useChatbotConversationListStore'
import { useChatbotConversationDetailStore } from './useChatbotConversationDetailStore'
import type { ChatbotConversationStatus } from '../model/chatbotconversationget.dto'

type State = {
  isSubmitting: boolean
  error: string | null
}

type Action = {
  updateStatus: (id: number, status: ChatbotConversationStatus) => Promise<boolean>
  bulkUpdateStatus: (ids: number[], status: ChatbotConversationStatus) => Promise<boolean>
}

export const useChatbotConversationStatusStore = create<State & Action>((set) => ({
  isSubmitting: false, error: null,

  updateStatus: async (id, status) => {
    set({ isSubmitting: true, error: null })
    try {
      const res = await chatbotConversationsService.patchStatus(id, { status })
      if (!res.success) { set({ isSubmitting: false, error: res.message }); return false }
      // Si el detalle abierto es esta conversación, se actualiza en memoria.
      if (useChatbotConversationDetailStore.getState().item?.id === id) useChatbotConversationDetailStore.getState().setStatus(status)
      if (useChatbotConversationListStore.getState().hasLoaded) await useChatbotConversationListStore.getState().load()
      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      set({ isSubmitting: false, error: error?.response?.data?.message ?? error?.message ?? 'Error al actualizar el estado.' })
      return false
    }
  },

  bulkUpdateStatus: async (ids, status) => {
    set({ isSubmitting: true, error: null })
    try {
      await Promise.all(ids.map((id) => chatbotConversationsService.patchStatus(id, { status })))
      await useChatbotConversationListStore.getState().load()
      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      await useChatbotConversationListStore.getState().load()
      set({ isSubmitting: false, error: error?.response?.data?.message ?? error?.message ?? 'No se pudieron actualizar todas las conversaciones.' })
      return false
    }
  },
}))
