import { create } from 'zustand'
import { testimonyService } from '../services/testimony.service'
import type { TestimonyPostRequestDto } from '../model/testimonypost.dto'
import type { TestimonyPutRequestDto } from '../model/testimonyput.dto'
import { useTestimonyListStore } from '@/features/testimony-web/stores/useTestimonyListStore'

type State = {
  isSubmitting: boolean
  error: string | null
  fieldErrors: Record<string, string[]> | null
}

type Action = {
  create: (params: TestimonyPostRequestDto) => Promise<boolean>
  update: (id: number, data: TestimonyPutRequestDto) => Promise<boolean>
  reset: () => void
}

export const useTestimonyFormStore = create<State & Action>((set) => ({
  isSubmitting: false, error: null, fieldErrors: null,

  create: async (params) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const res = await testimonyService.post(params)
      if (!res.success) {
        set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null })
        return false
      }
      await useTestimonyListStore.getState().load()
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
      const res = await testimonyService.patch(id, data)

      if (!res.success) {
        set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null })
        return false
      }
      await useTestimonyListStore.getState().load()
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
