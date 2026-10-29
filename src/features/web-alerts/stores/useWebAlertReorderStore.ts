// Guarda el nuevo orden de las alertas (pantalla "Ordenar").

import { create } from 'zustand'
import { webAlertsService } from '../services/web-alerts.service'
import { useWebAlertListStore } from './useWebAlertListStore'

type State = {
  isSubmitting: boolean
  error: string | null
}

type Action = {
  /** Manda los ids en el nuevo orden; la API deja 1, 2, 3... */
  confirm: (ids: number[]) => Promise<boolean>
}

export const useWebAlertReorderStore = create<State & Action>((set) => ({
  isSubmitting: false, error: null,

  confirm: async (ids) => {
    set({ isSubmitting: true, error: null })
    try {
      const res = await webAlertsService.reorder({ ids })
      if (!res.success) { set({ isSubmitting: false, error: res.message }); return false }
      useWebAlertListStore.getState().setForceReload(true)
      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      set({ isSubmitting: false, error: error?.response?.data?.message ?? error?.message ?? 'Error al guardar el orden.' })
      return false
    }
  },
}))
