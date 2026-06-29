import { create } from 'zustand'
import { furnituresService } from '../services/furnitures.service'
import type { FurniturePostRequestDto } from '../model/furniturepost.dto'
import type { FurniturePutRequestDto } from '../model/furnitureput.dto'
import { useFurnitureListStore } from '@/features/furnitures/stores/useFurnitureListStore'

type State = {
  isSubmitting: boolean
  error: string | null
  fieldErrors: Record<string, string[]> | null
}

type Action = {
  create: (params: FurniturePostRequestDto) => Promise<number | null>
  update: (id: number, data: FurniturePutRequestDto) => Promise<boolean>
  reset: () => void
}

export const useFurnitureFormStore = create<State & Action>((set) => ({
  isSubmitting: false, error: null, fieldErrors: null,

  create: async (params) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const res = await furnituresService.post(params)
      if (!res.success) {
        set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null })
        return null
      }
      await useFurnitureListStore.getState().load()
      set({ isSubmitting: false })
      return res.data.id_furniture
    } catch (error: any) {
      set({
        isSubmitting: false,
        error: error?.response?.data?.message ?? error?.message ?? 'Error al crear.',
        fieldErrors: error?.response?.data?.errors ?? null,
      })
      return null
    }
  },

  update: async (id, data) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const res = await furnituresService.patch(id, data)

      if (!res.success) {
        set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null })
        return false
      }
      await useFurnitureListStore.getState().load()
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
