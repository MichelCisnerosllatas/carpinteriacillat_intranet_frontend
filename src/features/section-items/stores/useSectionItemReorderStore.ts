import { create } from 'zustand'
import { sectionItemsService } from '../services/sectionitems.service'
import { useSectionItemListStore } from '@/features/section-items/stores/useSectionItemListStore'

type State = {
  isSubmitting: boolean
  error: string | null
  fieldErrors: Record<string, string[]> | null
}

type Action = {
  confirm: (idSection: number, ids: number[]) => Promise<boolean>
  reset: () => void
}

export const useSectionItemReorderStore = create<State & Action>((set) => ({
  isSubmitting: false, error: null, fieldErrors: null,

  confirm: async (idSection, ids) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const res = await sectionItemsService.reorder({ id_section: idSection, ids })
      if (!res.success) {
        set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null })
        return false
      }
      useSectionItemListStore.getState().setForceReload(true)
      await useSectionItemListStore.getState().load()
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
