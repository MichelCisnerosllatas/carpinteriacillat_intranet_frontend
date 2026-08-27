import { create } from 'zustand'
import { proformasService } from '../services/proformas.service'
import { useProformaListStore } from './useProformaListStore'
import type { ProformaStatus } from '../data/schema'

type State = {
  isLoading: boolean
  error: string | null
}

type Action = {
  changeStatus: (id: number, newStatus: ProformaStatus) => Promise<boolean>
  bulkChangeStatus: (ids: number[], newStatus: ProformaStatus) => Promise<boolean>
  deleteItem: (id: number) => Promise<boolean>
  bulkDeleteItems: (ids: number[]) => Promise<boolean>
}

export const useProformaDeleteStore = create<State & Action>((set) => ({
  isLoading: false,
  error: null,

  changeStatus: async (id, newStatus) => {
    set({ isLoading: true, error: null })
    try {
      await proformasService.patch(id, { status: newStatus })
      await useProformaListStore.getState().load()
      return true
    } catch {
      set({ error: 'No se pudo cambiar el estado.' })
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  bulkChangeStatus: async (ids, newStatus) => {
    set({ isLoading: true, error: null })
    try {
      await Promise.all(ids.map((id) => proformasService.patch(id, { status: newStatus })))
      await useProformaListStore.getState().load()
      return true
    } catch {
      set({ error: 'No se pudo cambiar el estado de todos los registros.' })
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  deleteItem: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await proformasService.delete(id)
      await useProformaListStore.getState().load()
      return true
    } catch {
      set({ error: 'No se pudo eliminar el registro.' })
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  bulkDeleteItems: async (ids) => {
    set({ isLoading: true, error: null })
    try {
      await Promise.all(ids.map((id) => proformasService.delete(id)))
      await useProformaListStore.getState().load()
      return true
    } catch {
      set({ error: 'No se pudieron eliminar los registros.' })
      return false
    } finally {
      set({ isLoading: false })
    }
  },
}))
