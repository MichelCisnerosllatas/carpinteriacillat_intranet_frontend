import { create } from 'zustand'
import { navigationsService } from '../services/navigations.service'
import { useNavigationListStore } from '@/features/navigations/stores/useNavigationListStore'

type State = {
  isSubmitting: boolean
  error: string | null
  fieldErrors: Record<string, string[]> | null
}

type Action = {
  confirm: (ids: number[]) => Promise<boolean>
  reset: () => void
}

export const useNavigationReorderStore = create<State & Action>((set) => ({
  isSubmitting: false, error: null, fieldErrors: null,

  confirm: async (ids) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const res = await navigationsService.reorder(ids)
      if (!res.success) {
        set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null })
        return false
      }
      useNavigationListStore.getState().setForceReload(true)
      await useNavigationListStore.getState().load()
      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      set({
        isSubmitting: false,
        error: error?.response?.data?.message ?? error?.message ?? 'Error al reordenar.',
        fieldErrors: error?.response?.data?.errors ?? null,
      })
      return false
    }
  },

  reset: () => set({ isSubmitting: false, error: null, fieldErrors: null }),
}))
