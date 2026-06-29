import { create } from 'zustand'
import { sectionImagesService } from '../services/sectionimages.service'
import type { SectionImagePostRequestDto } from '../model/sectionimagepost.dto'
import type { SectionImagePutRequestDto } from '../model/sectionimageput.dto'
import { useSectionImageListStore } from '@/features/sectionimages/stores/useSectionImageListStore'

type State = {
  isSubmitting: boolean
  error: string | null
  fieldErrors: Record<string, string[]> | null
}

type Action = {
  create: (params: SectionImagePostRequestDto) => Promise<boolean>
  update: (id: number, data: SectionImagePutRequestDto) => Promise<boolean>
  reset: () => void
}

export const useSectionImageFormStore = create<State & Action>((set) => ({
  isSubmitting: false, error: null, fieldErrors: null,

  create: async (params) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const res = await sectionImagesService.post(params)
      if (!res.success) {
        set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null })
        return false
      }
      await useSectionImageListStore.getState().load()
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
      const res = await sectionImagesService.put(id, data)
      if (!res.success) {
        set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null })
        return false
      }
      await useSectionImageListStore.getState().load()
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
