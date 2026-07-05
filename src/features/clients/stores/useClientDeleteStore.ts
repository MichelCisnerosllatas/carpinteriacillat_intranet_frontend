import { create } from 'zustand'
import { clientsService } from '../services/clients.service'
import { useClientListStore } from './useClientListStore'

type State = {
  isLoading: boolean
  error: string | null
}

type Action = {
  toggleState: (id: number, newState: number) => Promise<boolean>
  deleteItem: (id: number) => Promise<boolean>
  bulkToggleState: (ids: number[], newState: number) => Promise<boolean>
  bulkDeleteItems: (ids: number[]) => Promise<boolean>
}

export const useClientDeleteStore = create<State & Action>((set) => ({
  isLoading: false,
  error: null,

  toggleState: async (id, newState) => {
    set({ isLoading: true, error: null })
    try {
      await clientsService.patch(id, { status: newState })
      await useClientListStore.getState().load()
      return true
    } catch (error: any) {
      set({ error: error?.response?.data?.message ?? 'No se pudo cambiar el estado.' })
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  deleteItem: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await clientsService.delete(id)
      await useClientListStore.getState().load()
      return true
    } catch {
      set({ error: 'No se pudo eliminar el registro.' })
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  bulkToggleState: async (ids, newState) => {
    set({ isLoading: true, error: null })
    try {
      await Promise.all(ids.map((id) => clientsService.patch(id, { status: newState })))
      await useClientListStore.getState().load()
      return true
    } catch {
      set({ error: 'No se pudieron actualizar los registros.' })
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  bulkDeleteItems: async (ids) => {
    set({ isLoading: true, error: null })
    try {
      await Promise.all(ids.map((id) => clientsService.delete(id)))
      await useClientListStore.getState().load()
      return true
    } catch {
      set({ error: 'No se pudieron eliminar los registros.' })
      return false
    } finally {
      set({ isLoading: false })
    }
  },
}))
