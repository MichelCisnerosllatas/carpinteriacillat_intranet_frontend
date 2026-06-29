import { create } from 'zustand'
import { typesectionsService } from '../services/typesections.service'
import type { TypeSectionPostRequestDto } from '../model/typesectionpost.dto'
import type { TypeSectionPutRequestDto } from '../model/typesectionput.dto'
import { useTypeSectionListStore } from '@/features/typesections/stores/useTypeSectionListStore'

type State = {
  isSubmitting: boolean
  error: string | null
  fieldErrors: Record<string, string[]> | null
}

type Action = {
  create: (params: TypeSectionPostRequestDto) => Promise<boolean>
  update: (id: number, data: TypeSectionPutRequestDto) => Promise<boolean>
  reset: () => void
}

export const useTypeSectionFormStore = create<State & Action>((set) => ({
  isSubmitting: false, error: null, fieldErrors: null,

  create: async (params) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const res = await typesectionsService.post(params)
      if (!res.success) { set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null }); return false }
      await useTypeSectionListStore.getState().load()
      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      set({ isSubmitting: false, error: error?.response?.data?.message ?? error?.message ?? 'Error al crear.', fieldErrors: error?.response?.data?.errors ?? null })
      return false
    }
  },

  update: async (id, data) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const res = await typesectionsService.patch(id, data)
      if (!res.success) { set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null }); return false }
      await useTypeSectionListStore.getState().load()
      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      set({ isSubmitting: false, error: error?.response?.data?.message ?? error?.message ?? 'Error al actualizar.', fieldErrors: error?.response?.data?.errors ?? null })
      return false
    }
  },

  reset: () => set({ isSubmitting: false, error: null, fieldErrors: null }),
}))
