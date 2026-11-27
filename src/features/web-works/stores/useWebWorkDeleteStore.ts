import { create } from 'zustand'
import { webWorksService } from '../services/web-works.service'
import { useWebWorkListStore } from './useWebWorkListStore'

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

export const useWebWorkDeleteStore = create<State & Action>((set) => ({
  isLoading: false,
  error: null,

  // PATCH solo con el estado: no toca images/pairs (las claves no viajan → no se sincronizan).
  toggleState: async (id, newState) => {
    set({ isLoading: true, error: null })
    try {
      await webWorksService.patch(id, { webwork_state: newState })
      await useWebWorkListStore.getState().load()
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
      await webWorksService.delete(id)
      await useWebWorkListStore.getState().load()
      return true
    } catch (error: any) {
      set({ error: error?.response?.data?.message ?? 'No se pudo eliminar el trabajo.' })
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  bulkToggleState: async (ids, newState) => {
    set({ isLoading: true, error: null })
    try {
      await Promise.all(ids.map((id) => webWorksService.patch(id, { webwork_state: newState })))
      await useWebWorkListStore.getState().load()
      return true
    } catch (error: any) {
      await useWebWorkListStore.getState().load()
      set({ error: error?.response?.data?.message ?? 'No se pudieron actualizar los trabajos.' })
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  bulkDeleteItems: async (ids) => {
    set({ isLoading: true, error: null })
    try {
      await Promise.all(ids.map((id) => webWorksService.delete(id)))
      await useWebWorkListStore.getState().load()
      return true
    } catch (error: any) {
      await useWebWorkListStore.getState().load()
      set({ error: error?.response?.data?.message ?? 'No se pudieron eliminar los trabajos.' })
      return false
    } finally {
      set({ isLoading: false })
    }
  },
}))
