import { create } from 'zustand'
import { testimonyWebSettingService } from '../services/testimonywebsetting.service'
import type { TestimonyWebSettingApiItem, TestimonyWebSettingUpdateRequestDto } from '../model/testimonywebsetting.dto'

type State = {
  isLoading: boolean
  isSubmitting: boolean
  isError: boolean
  error: string | null
  fieldErrors: Record<string, string[]> | null
  setting: TestimonyWebSettingApiItem | null
}

type Action = {
  get: () => Promise<boolean>
  update: (data: TestimonyWebSettingUpdateRequestDto) => Promise<boolean>
  reset: () => void
}

export const useTestimonyWebSettingStore = create<State & Action>((set) => ({
  isLoading: false, isSubmitting: false, isError: false, error: null, fieldErrors: null, setting: null,

  get: async () => {
    set({ isLoading: true, isError: false, error: null })
    try {
      const res = await testimonyWebSettingService.get()
      if (!res.success) throw new Error(res.message)
      set({ isLoading: false, setting: res.data })
      return true
    } catch (error: any) {
      set({ isLoading: false, isError: true, error: error?.response?.data?.message ?? error?.message ?? 'Error al cargar la configuración.' })
      return false
    }
  },

  update: async (data) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const res = await testimonyWebSettingService.update(data)
      if (!res.success) {
        set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null })
        return false
      }
      set({ isSubmitting: false, setting: res.data })
      return true
    } catch (error: any) {
      set({
        isSubmitting: false,
        error: error?.response?.data?.message ?? error?.message ?? 'Error al actualizar la configuración.',
        fieldErrors: error?.response?.data?.errors ?? null,
      })
      return false
    }
  },

  reset: () => set({ isLoading: false, isSubmitting: false, isError: false, error: null, fieldErrors: null, setting: null }),
}))
