import { create } from 'zustand'
import { userService } from '../services/user.service'
import { useUserListStore } from './useUserListStore'

type State = {
  isLoading: boolean
  error: string | null
}

type Action = {
  toggleState: (id: number, newState: number) => Promise<boolean>
  deleteItem: (id: number) => Promise<boolean>
  bulkToggleState: (rows: Array<{ id: number }>, newState: number) => Promise<boolean>
  bulkDeleteItems: (ids: number[]) => Promise<boolean>
}

export const useUserDeleteStore = create<State & Action>((set) => ({
  isLoading: false,
  error: null,

  toggleState: async (id, newState) => {
    set({ isLoading: true, error: null })
    try {
      await userService.patch(String(id), { user_state: newState })
      await useUserListStore.getState().load()
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
      await userService.delete(id)
      await useUserListStore.getState().load()
      return true
    } catch {
      set({ error: 'No se pudo eliminar el usuario.' })
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  bulkToggleState: async (rows, newState) => {
    set({ isLoading: true, error: null })
    try {
      await Promise.all(rows.map((r) => userService.patch(String(r.id), { user_state: newState })))
      await useUserListStore.getState().load()
      return true
    } catch {
      set({ error: 'No se pudieron actualizar los usuarios.' })
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  bulkDeleteItems: async (ids) => {
    set({ isLoading: true, error: null })
    try {
      await Promise.all(ids.map((id) => userService.delete(id)))
      await useUserListStore.getState().load()
      return true
    } catch {
      set({ error: 'No se pudieron eliminar los usuarios.' })
      return false
    } finally {
      set({ isLoading: false })
    }
  },
}))
