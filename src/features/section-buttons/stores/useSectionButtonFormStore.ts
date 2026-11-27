import { create } from 'zustand'
import { sectionButtonsService } from '../services/sectionbuttons.service'
import type { SectionButtonPostRequestDto } from '../model/sectionbuttonpost.dto'
import type { SectionButtonPutRequestDto } from '../model/sectionbuttonput.dto'
import { useSectionButtonListStore } from '@/features/section-buttons/stores/useSectionButtonListStore'

type State = {
  isSubmitting: boolean
  error: string | null
  fieldErrors: Record<string, string[]> | null
}

type Action = {
  create: (params: SectionButtonPostRequestDto) => Promise<boolean>
  update: (id: number, data: SectionButtonPutRequestDto) => Promise<boolean>
  reset: () => void
}

export const useSectionButtonFormStore = create<State & Action>((set) => ({
  isSubmitting: false, error: null, fieldErrors: null,

  create: async (params) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const res = await sectionButtonsService.post(params)
      if (!res.success) {
        set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null })
        return false
      }
      await useSectionButtonListStore.getState().load()
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
      const res = await sectionButtonsService.patch(id, data)

      if (!res.success) {
        set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null })
        return false
      }
      await useSectionButtonListStore.getState().load()
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
