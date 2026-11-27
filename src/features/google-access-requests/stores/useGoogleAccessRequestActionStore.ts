import { create } from 'zustand'
import { googleAccessRequestService } from '../services/googleaccessrequest.service'
import { useGoogleAccessRequestListStore } from './useGoogleAccessRequestListStore'

type State = {
  isSubmitting: boolean
  error: string | null
}

type Action = {
  approve: (id: number, idRol: number) => Promise<boolean>
  reject: (id: number) => Promise<boolean>
  reset: () => void
}

export const useGoogleAccessRequestActionStore = create<State & Action>((set) => ({
  isSubmitting: false, error: null,

  approve: async (id, idRol) => {
    set({ isSubmitting: true, error: null })
    try {
      const response = await googleAccessRequestService.approve(id, { id_rol: idRol })
      if (!response.success) {
        set({ isSubmitting: false, error: response.message })
        return false
      }
      useGoogleAccessRequestListStore.getState().setForceReload(true)
      await useGoogleAccessRequestListStore.getState().load()
      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      set({ isSubmitting: false, error: error?.response?.data?.message ?? error?.message ?? 'No se pudo aprobar la solicitud.' })
      return false
    }
  },

  reject: async (id) => {
    set({ isSubmitting: true, error: null })
    try {
      const response = await googleAccessRequestService.reject(id)
      if (!response.success) {
        set({ isSubmitting: false, error: response.message })
        return false
      }
      useGoogleAccessRequestListStore.getState().setForceReload(true)
      await useGoogleAccessRequestListStore.getState().load()
      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      set({ isSubmitting: false, error: error?.response?.data?.message ?? error?.message ?? 'No se pudo rechazar la solicitud.' })
      return false
    }
  },

  reset: () => set({ isSubmitting: false, error: null }),
}))
