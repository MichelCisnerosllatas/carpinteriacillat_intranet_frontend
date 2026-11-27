// Guarda el estado del formulario de alertas al crear o editar (cargando, error, errores por campo).

import { create } from 'zustand'
import { webAlertsService } from '../services/web-alerts.service'
import type { WebAlertPostRequestDto } from '../model/webalertpost.dto'
import type { WebAlertPutRequestDto } from '../model/webalertput.dto'
import { useWebAlertListStore } from './useWebAlertListStore'

type State = {
  isSubmitting: boolean
  error: string | null
  fieldErrors: Record<string, string[]> | null
}

type Action = {
  create: (params: WebAlertPostRequestDto) => Promise<boolean>
  update: (id: number, params: WebAlertPutRequestDto) => Promise<boolean>
  reset: () => void
}

export const useWebAlertFormStore = create<State & Action>((set) => ({
  isSubmitting: false, error: null, fieldErrors: null,

  create: async (params) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const res = await webAlertsService.post(params)
      if (!res.success) { set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null }); return false }
      // La lista se vuelve a pedir al regresar
      useWebAlertListStore.getState().setForceReload(true)
      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      set({ isSubmitting: false, error: error?.response?.data?.message ?? error?.message ?? 'Error al crear.', fieldErrors: error?.response?.data?.errors ?? null })
      return false
    }
  },

  update: async (id, params) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const res = await webAlertsService.put(id, params)
      if (!res.success) { set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null }); return false }
      useWebAlertListStore.getState().setForceReload(true)
      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      set({ isSubmitting: false, error: error?.response?.data?.message ?? error?.message ?? 'Error al guardar.', fieldErrors: error?.response?.data?.errors ?? null })
      return false
    }
  },

  reset: () => set({ isSubmitting: false, error: null, fieldErrors: null }),
}))
