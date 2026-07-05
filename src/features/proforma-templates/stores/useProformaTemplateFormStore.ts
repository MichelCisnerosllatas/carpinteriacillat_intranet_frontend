import { create } from 'zustand'
import { proformaTemplatesService } from '../services/proforma-templates.service'
import type { ProformaTemplatePostRequestDto } from '../model/proformatemplatepost.dto'
import type { ProformaTemplatePutRequestDto } from '../model/proformatemplateput.dto'
import { useProformaTemplateListStore, mapProformaTemplateFromApi } from './useProformaTemplateListStore'
import type { ProformaTemplate } from '../data/schema'

type State = {
  isSubmitting: boolean
  error: string | null
  fieldErrors: Record<string, string[]> | null
}

type Action = {
  create: (params: ProformaTemplatePostRequestDto) => Promise<ProformaTemplate | null>
  update: (id: number, data: Partial<ProformaTemplatePutRequestDto>) => Promise<boolean>
  reset: () => void
}

export const useProformaTemplateFormStore = create<State & Action>((set) => ({
  isSubmitting: false, error: null, fieldErrors: null,

  create: async (params) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const res = await proformaTemplatesService.post(params)
      if (!res.success) { set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null }); return null }
      await useProformaTemplateListStore.getState().load()
      set({ isSubmitting: false })
      return mapProformaTemplateFromApi({ ...res.data, proforma_type: null, texts: [] })
    } catch (error: any) {
      set({ isSubmitting: false, error: error?.response?.data?.message ?? error?.message ?? 'Error al crear.', fieldErrors: error?.response?.data?.errors ?? null })
      return null
    }
  },

  update: async (id, data) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const res = await proformaTemplatesService.patch(id, data)
      if (!res.success) { set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null }); return false }
      await useProformaTemplateListStore.getState().load()
      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      set({ isSubmitting: false, error: error?.response?.data?.message ?? error?.message ?? 'Error al actualizar.', fieldErrors: error?.response?.data?.errors ?? null })
      return false
    }
  },

  reset: () => set({ isSubmitting: false, error: null, fieldErrors: null }),
}))
