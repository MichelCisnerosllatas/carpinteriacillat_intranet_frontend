import { create } from 'zustand'
import { sectionItemDetailsService } from '../services/sectionitemdetails.service'
import type { SectionItemDetailPostRequestDto } from '../model/sectionitemdetailpost.dto'
import type { SectionItemDetailPutRequestDto } from '../model/sectionitemdetailput.dto'
import { useSectionItemDetailListStore } from '@/features/section-item-details/stores/useSectionItemDetailListStore'

type State = {
  isSubmitting: boolean
  error: string | null
  fieldErrors: Record<string, string[]> | null
}

type Action = {
  create: (params: SectionItemDetailPostRequestDto) => Promise<boolean>
  update: (id: number, data: SectionItemDetailPutRequestDto) => Promise<boolean>
  reset: () => void
}

export const useSectionItemDetailFormStore = create<State & Action>((set) => ({
  isSubmitting: false, error: null, fieldErrors: null,

  create: async (params) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const res = await sectionItemDetailsService.post(params)
      if (!res.success) {
        set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null })
        return false
      }
      await useSectionItemDetailListStore.getState().load()
      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      set({
        isSubmitting: false,
        error: error?.response?.data?.message ?? error?.message ?? 'Error al crear.',
        fieldErrors: error?.response?.data?.errors ?? null,
      })
      return false
    }
  },

  update: async (id, data) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const res = await sectionItemDetailsService.patch(id, data)

      if (!res.success) {
        set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null })
        return false
      }
      await useSectionItemDetailListStore.getState().load()
      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      set({
        isSubmitting: false,
        error: error?.response?.data?.message ?? error?.message ?? 'Error al actualizar.',
        fieldErrors: error?.response?.data?.errors ?? null,
      })
      return false
    }
  },

  reset: () => set({ isSubmitting: false, error: null, fieldErrors: null }),
}))
