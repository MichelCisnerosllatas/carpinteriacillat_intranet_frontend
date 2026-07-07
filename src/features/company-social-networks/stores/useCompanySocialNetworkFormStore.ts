import { create } from 'zustand'
import { companySocialNetworksService } from '../services/company-social-networks.service'
import type { CompanySocialNetworkPostRequestDto } from '../model/companysocialnetworkpost.dto'
import type { CompanySocialNetworkPutRequestDto } from '../model/companysocialnetworkput.dto'
import { useCompanySocialNetworkListStore } from './useCompanySocialNetworkListStore'

type State = {
  isSubmitting: boolean
  error: string | null
  fieldErrors: Record<string, string[]> | null
}

type Action = {
  create: (params: CompanySocialNetworkPostRequestDto) => Promise<boolean>
  update: (id: number, data: CompanySocialNetworkPutRequestDto) => Promise<boolean>
  reset: () => void
}

export const useCompanySocialNetworkFormStore = create<State & Action>((set) => ({
  isSubmitting: false, error: null, fieldErrors: null,

  create: async (params) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const res = await companySocialNetworksService.post(params)
      if (!res.success) { set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null }); return false }
      await useCompanySocialNetworkListStore.getState().load()
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
      const res = await companySocialNetworksService.patch(id, data)
      if (!res.success) { set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null }); return false }
      await useCompanySocialNetworkListStore.getState().load()
      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      set({ isSubmitting: false, error: error?.response?.data?.message ?? error?.message ?? 'Error al actualizar.', fieldErrors: error?.response?.data?.errors ?? null })
      return false
    }
  },

  reset: () => set({ isSubmitting: false, error: null, fieldErrors: null }),
}))
