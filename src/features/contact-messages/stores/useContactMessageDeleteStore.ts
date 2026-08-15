import { create } from 'zustand'
import { contactMessagesService } from '../services/contact-messages.service'
import { useContactMessageListStore } from './useContactMessageListStore'

type State = {
  isLoading: boolean
  error: string | null
}

type Action = {
  deleteItem: (id: number) => Promise<boolean>
  bulkDeleteItems: (ids: number[]) => Promise<boolean>
}

export const useContactMessageDeleteStore = create<State & Action>((set) => ({
  isLoading: false,
  error: null,

  deleteItem: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await contactMessagesService.delete(id)
      await useContactMessageListStore.getState().load()
      return true
    } catch {
      set({ error: 'No se pudo eliminar el registro.' })
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  bulkDeleteItems: async (ids) => {
    set({ isLoading: true, error: null })
    try {
      await Promise.all(ids.map((id) => contactMessagesService.delete(id)))
      await useContactMessageListStore.getState().load()
      return true
    } catch {
      set({ error: 'No se pudieron eliminar los registros.' })
      return false
    } finally {
      set({ isLoading: false })
    }
  },
}))
