// src/features/images/stores/useImageUploadStore.ts
import { create } from 'zustand'
import { imagesService } from '../services/images.service'

type State = {
  isSubmitting: boolean
  error: string | null
  fieldErrors: Record<string, string[]> | null
}

type Action = {
  upload: (formData: FormData) => Promise<boolean>
  reset: () => void
}

export const useImageUploadStore = create<State & Action>((set) => ({
  isSubmitting: false, error: null, fieldErrors: null,

  upload: async (formData) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const res = await imagesService.upload(formData)
      if (!res.success) {
        set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null })
        return false
      }


      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      set({
        isSubmitting: false,
        error: error?.response?.data?.message ?? error?.message ?? 'Error al subir la imagen.',
        fieldErrors: error?.response?.data?.errors ?? null,
      })
      return false
    }
  },

  reset: () => set({ isSubmitting: false, error: null, fieldErrors: null }),
}))
