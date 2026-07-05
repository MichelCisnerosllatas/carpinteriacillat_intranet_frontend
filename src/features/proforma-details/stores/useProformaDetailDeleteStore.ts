import { create } from 'zustand'
import { proformaDetailsService } from '../services/proforma-details.service'
import { useProformaDetailListStore } from './useProformaDetailListStore'

type State = {
  isLoading: boolean
  error: string | null
}

type Action = {
  deleteItem: (id: number, proformaId?: number) => Promise<boolean>
  bulkDeleteItems: (ids: number[], proformaId?: number) => Promise<boolean>
}

export const useProformaDetailDeleteStore = create<State & Action>((set) => ({
  isLoading: false,
  error: null,

  deleteItem: async (id, proformaId) => {
    set({ isLoading: true, error: null })
    try {
      await proformaDetailsService.delete(id)
      if (proformaId) await useProformaDetailListStore.getState().loadByProforma(proformaId)
      return true
    } catch {
      set({ error: 'No se pudo eliminar el registro.' })
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  bulkDeleteItems: async (ids, proformaId) => {
    set({ isLoading: true, error: null })
    try {
      await Promise.all(ids.map((id) => proformaDetailsService.delete(id)))
      if (proformaId) await useProformaDetailListStore.getState().loadByProforma(proformaId)
      return true
    } catch {
      set({ error: 'No se pudieron eliminar los registros.' })
      return false
    } finally {
      set({ isLoading: false })
    }
  },
}))
