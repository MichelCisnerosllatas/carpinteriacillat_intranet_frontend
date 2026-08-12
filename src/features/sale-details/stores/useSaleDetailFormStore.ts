import { create } from 'zustand'
import { saleDetailsService } from '../services/sale-details.service'
import type { SaleDetailPostRequestDto } from '../model/saledetailpost.dto'
import type { SaleDetailPutRequestDto } from '../model/saledetailput.dto'
import { useSaleDetailListStore } from './useSaleDetailListStore'

type State = {
  isSubmitting: boolean
  error: string | null
  fieldErrors: Record<string, string[]> | null
}

type Action = {
  create: (params: SaleDetailPostRequestDto) => Promise<boolean>
  update: (id: number, data: SaleDetailPutRequestDto) => Promise<boolean>
  reset: () => void
}

export const useSaleDetailFormStore = create<State & Action>((set) => ({
  isSubmitting: false, error: null, fieldErrors: null,

  create: async (params) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const res = await saleDetailsService.post(params)
      if (!res.success) { set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null }); return false }
      await useSaleDetailListStore.getState().loadBySale(params.sale_id)
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
      const res = await saleDetailsService.patch(id, data)
      if (!res.success) { set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null }); return false }
      if (data.sale_id) await useSaleDetailListStore.getState().loadBySale(data.sale_id)
      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      set({ isSubmitting: false, error: error?.response?.data?.message ?? error?.message ?? 'Error al actualizar.', fieldErrors: error?.response?.data?.errors ?? null })
      return false
    }
  },

  reset: () => set({ isSubmitting: false, error: null, fieldErrors: null }),
}))
