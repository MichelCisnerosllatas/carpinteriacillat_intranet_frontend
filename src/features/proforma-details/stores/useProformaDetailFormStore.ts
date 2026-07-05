import { create } from 'zustand'
import { proformaDetailsService } from '../services/proforma-details.service'
import type { ProformaDetailPostRequestDto } from '../model/proformadetailpost.dto'
import type { ProformaDetailPutRequestDto } from '../model/proformadetailput.dto'
import { useProformaDetailListStore } from './useProformaDetailListStore'

type State = {
  isSubmitting: boolean
  error: string | null
  fieldErrors: Record<string, string[]> | null
}

type Action = {
  create: (params: ProformaDetailPostRequestDto) => Promise<boolean>
  update: (id: number, data: ProformaDetailPutRequestDto) => Promise<boolean>
  reset: () => void
}

export const useProformaDetailFormStore = create<State & Action>((set) => ({
  isSubmitting: false, error: null, fieldErrors: null,

  create: async (params) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const res = await proformaDetailsService.post(params)
      if (!res.success) { set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null }); return false }
      await useProformaDetailListStore.getState().loadByProforma(params.proforma_id)
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
      const res = await proformaDetailsService.patch(id, data)
      if (!res.success) { set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null }); return false }
      if (data.proforma_id) await useProformaDetailListStore.getState().loadByProforma(data.proforma_id)
      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      set({ isSubmitting: false, error: error?.response?.data?.message ?? error?.message ?? 'Error al actualizar.', fieldErrors: error?.response?.data?.errors ?? null })
      return false
    }
  },

  reset: () => set({ isSubmitting: false, error: null, fieldErrors: null }),
}))
