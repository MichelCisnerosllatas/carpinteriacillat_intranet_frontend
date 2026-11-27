import { create } from 'zustand'
import { typeworksService } from '../services/typeworks.service'
import { useTypeWorkListStore } from './useTypeWorkListStore'

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

export const useTypeWorkDeleteStore = create<State & Action>((set) => ({
  isLoading: false,
  error: null,

  toggleState: async (id, newState) => {
    set({ isLoading: true, error: null })
    try {
      await typeworksService.patch(id, { typework_state: newState })
      await useTypeWorkListStore.getState().load()
      return true
    } catch {
      set({ error: 'No se pudo cambiar el estado.' })
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  deleteItem: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await typeworksService.delete(id)
      await useTypeWorkListStore.getState().load()
      return true
    } catch (error: any) {
      // 409 = el tipo tiene trabajos asociados: se muestra el mensaje de la API tal cual.
      set({ error: error?.response?.data?.message ?? 'No se pudo eliminar el registro.' })
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  bulkToggleState: async (ids, newState) => {
    set({ isLoading: true, error: null })
    try {
      await Promise.all(ids.map((id) => typeworksService.patch(id, { typework_state: newState })))
      await useTypeWorkListStore.getState().load()
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
      await Promise.all(ids.map((id) => typeworksService.delete(id)))
      await useTypeWorkListStore.getState().load()
      return true
    } catch (error: any) {
      await useTypeWorkListStore.getState().load()
      set({ error: error?.response?.data?.message ?? 'No se pudieron eliminar los registros.' })
      return false
    } finally {
      set({ isLoading: false })
    }
  },
}))
