import { create } from 'zustand'
import { contactMessagesService } from '../services/contact-messages.service'
import { useContactMessageListStore } from './useContactMessageListStore'
import type { ContactMessageStatus } from '../data/schema'

type State = {
  isSubmitting: boolean
  error: string | null
}

type Action = {
  updateStatus: (id: number, status: ContactMessageStatus) => Promise<boolean>
  bulkUpdateStatus: (ids: number[], status: ContactMessageStatus) => Promise<boolean>
  reset: () => void
}

export const useContactMessageStatusStore = create<State & Action>((set) => ({
  isSubmitting: false, error: null,

  updateStatus: async (id, status) => {
    set({ isSubmitting: true, error: null })
    try {
      const res = await contactMessagesService.patchStatus(id, { status })
      if (!res.success) { set({ isSubmitting: false, error: res.message }); return false }
      await useContactMessageListStore.getState().load()
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
      await Promise.all(ids.map((id) => contactMessagesService.patchStatus(id, { status })))
      await useContactMessageListStore.getState().load()
      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      set({ isSubmitting: false, error: error?.response?.data?.message ?? error?.message ?? 'No se pudieron actualizar los registros.' })
      return false
    }
  },

  reset: () => set({ isSubmitting: false, error: null }),
}))
