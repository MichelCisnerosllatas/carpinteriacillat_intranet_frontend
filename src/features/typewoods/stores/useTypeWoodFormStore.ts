import { create } from 'zustand'
import { typewoodsService } from '../services/typewoods.service'
import type { TypeWoodPostRequestDto } from '../model/typewoodpost.dto'
import type { TypeWoodPutRequestDto } from '../model/typewoodput.dto'

type State = {
  isSubmitting: boolean
  error: string | null
  fieldErrors: Record<string, string[]> | null
}

type Action = {
  create: (params: TypeWoodPostRequestDto) => Promise<boolean>
  update: (id: number, data: TypeWoodPutRequestDto) => Promise<boolean>
  reset: () => void
}

export const useTypeWoodFormStore = create<State & Action>((set) => ({
  isSubmitting: false, error: null, fieldErrors: null,

  create: async (params) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const res = await typewoodsService.post(params)
      if (!res.success) { set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null }); return false }
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
      const hasEmpty = Object.values(data).some((v) => v === null || v === undefined || v === '')
      const res = hasEmpty
        ? await typewoodsService.patch(id, Object.fromEntries(Object.entries(data).filter(([, v]) => v !== null && v !== undefined && v !== '')) as Partial<TypeWoodPutRequestDto>)
        : await typewoodsService.put(id, data)
      if (!res.success) { set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null }); return false }
      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      set({ isSubmitting: false, error: error?.response?.data?.message ?? error?.message ?? 'Error al actualizar.', fieldErrors: error?.response?.data?.errors ?? null })
      return false
    }
  },

  reset: () => set({ isSubmitting: false, error: null, fieldErrors: null }),
}))
