import { create } from 'zustand'
import { sectionsService } from '../services/sections.service'
import { useSectionListStore } from '@/features/sections/stores/useSectionListStore'

type State = {
  isSubmitting: boolean
  error: string | null
  fieldErrors: Record<string, string[]> | null
}

type Action = {
  confirm: (ids: number[]) => Promise<boolean>
  reset: () => void
}

export const useSectionReorderStore = create<State & Action>((set) => ({
  isSubmitting: false, error: null, fieldErrors: null,

  confirm: async (ids) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const res = await sectionsService.reorder(ids)
      if (!res.success) {
        set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null })
        return false
      }
      useSectionListStore.getState().setForceReload(true)
      await useSectionListStore.getState().load()
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
