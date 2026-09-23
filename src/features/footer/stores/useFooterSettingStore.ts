import { create } from 'zustand'
import { footerSettingService } from '../services/footersetting.service'
import type { FooterSettingApiItem, FooterSettingUpdateRequestDto } from '../model/footersetting.dto'

type State = {
  isLoading: boolean
  isSubmitting: boolean
  isError: boolean
  error: string | null
  fieldErrors: Record<string, string[]> | null
  setting: FooterSettingApiItem | null
}

type Action = {
  get: () => Promise<boolean>
  update: (data: FooterSettingUpdateRequestDto) => Promise<boolean>
  reset: () => void
}

/**
 * Store propio del tab "Visibilidad" de `/footer` — independiente de cualquier otro store
 * (mismo criterio que `useTestimonyWebSettingStore`/`useSectionContentVisibilityStore`): cada
 * pantalla de configuración maneja su propio isSubmitting/error, sin pisarse entre sí.
 */
export const useFooterSettingStore = create<State & Action>((set) => ({
  isLoading: false, isSubmitting: false, isError: false, error: null, fieldErrors: null, setting: null,

  get: async () => {
    set({ isLoading: true, isError: false, error: null })
    try {
      const res = await footerSettingService.get()
      if (!res.success) throw new Error(res.message)
      set({ isLoading: false, setting: res.data })
      return true
    } catch (error: any) {
      set({
        isLoading: false,
        isError: true,
        error: error?.response?.data?.message ?? error?.message ?? 'Error al cargar la configuración del footer.',
      })
      return false
    }
  },

  update: async (data) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const res = await footerSettingService.update(data)
      if (!res.success) {
        set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null })
        return false
      }
      set({ isSubmitting: false, setting: res.data })
      return true
    } catch (error: any) {
      set({
        isSubmitting: false,
        error: error?.response?.data?.message ?? error?.message ?? 'Error al actualizar la configuración del footer.',
        fieldErrors: error?.response?.data?.errors ?? null,
      })
      return false
    }
  },

  reset: () => set({ isLoading: false, isSubmitting: false, isError: false, error: null, fieldErrors: null, setting: null }),
}))
