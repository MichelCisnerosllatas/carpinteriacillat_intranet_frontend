import { create } from 'zustand'
import { proformaNotesService } from '../services/proforma-notes.service'
import type { ProformaNotePostRequestDto } from '../model/proformanotepost.dto'
import type { ProformaNotePutRequestDto } from '../model/proformanoteput.dto'
import { useProformaNoteListStore } from './useProformaNoteListStore'

type State = {
  isSubmitting: boolean
  error: string | null
  fieldErrors: Record<string, string[]> | null
}

type Action = {
  create: (params: ProformaNotePostRequestDto) => Promise<boolean>
  update: (id: number, data: ProformaNotePutRequestDto) => Promise<boolean>
  reset: () => void
}

export const useProformaNoteFormStore = create<State & Action>((set) => ({
  isSubmitting: false, error: null, fieldErrors: null,

  create: async (params) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const res = await proformaNotesService.post(params)
      if (!res.success) { set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null }); return false }
      await useProformaNoteListStore.getState().loadByProforma(params.proforma_id)
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
      const res = await proformaNotesService.patch(id, data)
      if (!res.success) { set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null }); return false }
      if (data.proforma_id) await useProformaNoteListStore.getState().loadByProforma(data.proforma_id)
      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      set({ isSubmitting: false, error: error?.response?.data?.message ?? error?.message ?? 'Error al actualizar.', fieldErrors: error?.response?.data?.errors ?? null })
      return false
    }
  },

  reset: () => set({ isSubmitting: false, error: null, fieldErrors: null }),
}))
