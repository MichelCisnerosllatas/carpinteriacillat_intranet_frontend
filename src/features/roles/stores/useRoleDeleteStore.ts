import { create } from 'zustand'
import { rolesService } from '../services/roles.service'
import { useRoleListStore } from './useRoleListStore'

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

export const useRoleDeleteStore = create<State & Action>((set) => ({
  isLoading: false,
  error: null,

  toggleState: async (id, newState) => {
    set({ isLoading: true, error: null })
    try {
      await rolesService.patch(id, { role_state: newState })
      await useRoleListStore.getState().load()
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
      await rolesService.delete(id)
      await useRoleListStore.getState().load()
      return true
    } catch {
      set({ error: 'No se pudo eliminar el rol.' })
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  bulkToggleState: async (ids, newState) => {
    set({ isLoading: true, error: null })
    try {
      await Promise.all(ids.map((id) => rolesService.patch(id, { role_state: newState })))
      await useRoleListStore.getState().load()
      return true
    } catch {
      set({ error: 'No se pudieron actualizar los roles.' })
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  bulkDeleteItems: async (ids) => {
    set({ isLoading: true, error: null })
    try {
      await Promise.all(ids.map((id) => rolesService.delete(id)))
      await useRoleListStore.getState().load()
      return true
    } catch {
      set({ error: 'No se pudieron eliminar los roles.' })
      return false
    } finally {
      set({ isLoading: false })
    }
  },
}))
