import { create } from 'zustand'
import { clientsService } from '../services/clients.service'
import type { ClientPostRequestDto } from '../model/clientpost.dto'
import type { ClientPutRequestDto } from '../model/clientput.dto'
import type { ClientApiItem } from '../model/client-api-item.dto'
import { useClientListStore } from '@/features/clients/stores/useClientListStore'

type State = {
  isSubmitting: boolean
  error: string | null
  fieldErrors: Record<string, string[]> | null
}

type Action = {
  /** Devuelve el cliente creado (para poder seleccionarlo de inmediato, ej. autoseleccionarlo desde
   * un picker) o null si falló. */
  create: (params: ClientPostRequestDto) => Promise<ClientApiItem | null>
  update: (id: number, data: ClientPutRequestDto) => Promise<boolean>
  reset: () => void
}

export const useClientFormStore = create<State & Action>((set) => ({
  isSubmitting: false, error: null, fieldErrors: null,

  create: async (params) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const res = await clientsService.post(params)
      if (!res.success) { set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null }); return null }
      await useClientListStore.getState().load()
      set({ isSubmitting: false })
      return res.data
    } catch (error: any) {
      set({ isSubmitting: false, error: error?.response?.data?.message ?? error?.message ?? 'Error al crear.', fieldErrors: error?.response?.data?.errors ?? null })
      return null
    }
  },

  update: async (id, data) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const res = await clientsService.patch(id, data)
      if (!res.success) { set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null }); return false }
      await useClientListStore.getState().load()
      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      set({ isSubmitting: false, error: error?.response?.data?.message ?? error?.message ?? 'Error al actualizar.', fieldErrors: error?.response?.data?.errors ?? null })
      return false
    }
  },

  reset: () => set({ isSubmitting: false, error: null, fieldErrors: null }),
}))
