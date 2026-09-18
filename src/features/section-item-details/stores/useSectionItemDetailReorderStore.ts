import { create } from 'zustand'
import { sectionItemDetailsService } from '../services/sectionitemdetails.service'
import { useSectionItemDetailListStore } from '@/features/section-item-details/stores/useSectionItemDetailListStore'

type State = {
  isSubmitting: boolean
  error: string | null
  fieldErrors: Record<string, string[]> | null
}

type Action = {
  confirm: (idSectionItem: number, ids: number[]) => Promise<boolean>
  reset: () => void
}

export const useSectionItemDetailReorderStore = create<State & Action>((set) => ({
  isSubmitting: false, error: null, fieldErrors: null,

  confirm: async (idSectionItem, ids) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const res = await sectionItemDetailsService.reorder({ id_section_item: idSectionItem, ids })
      if (!res.success) {
        set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null })
        return false
      }
      useSectionItemDetailListStore.getState().setForceReload(true)
      await useSectionItemDetailListStore.getState().load()
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
