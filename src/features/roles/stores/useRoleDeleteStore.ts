import { create } from 'zustand'
import { rolesService } from '../services/roles.service'
import { useRoleListStore } from './useRoleListStore'

type State = {
  isLoading: boolean
  /** Mensaje del último error (el del backend si vino, ej. el 409 de "rol con usuarios"). */
  error: string | null
}

type Action = {
  toggleState: (id: number, newState: number) => Promise<boolean>
  deleteItem: (id: number) => Promise<boolean>
  bulkToggleState: (ids: number[], newState: number) => Promise<boolean>
  bulkDeleteItems: (ids: number[]) => Promise<boolean>
}

/** Saca el mensaje del backend de un error de axios; si no hay, usa el texto por defecto. */
const getApiMessage = (error: any, fallback: string): string =>
  error?.response?.data?.message || fallback

export const useRoleDeleteStore = create<State & Action>((set) => ({
  isLoading: false,
  error: null,

  toggleState: async (id, newState) => {
    set({ isLoading: true, error: null })
    try {
      await rolesService.patch(id, { role_state: newState })
      await useRoleListStore.getState().load()
      return true
    } catch (error: any) {
      set({ error: getApiMessage(error, 'No se pudo cambiar el estado.') })
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
    } catch (error: any) {
      // 409 = el rol tiene usuarios asignados → el backend explica qué hacer en `message`.
      set({ error: getApiMessage(error, 'No se pudo eliminar el rol.') })
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
    } catch (error: any) {
      set({ error: getApiMessage(error, 'No se pudieron actualizar los roles.') })
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  bulkDeleteItems: async (ids) => {
    set({ isLoading: true, error: null })
    try {
      // allSettled: se intentan borrar todos aunque alguno falle (ej. 409 por tener usuarios).
      const results = await Promise.allSettled(ids.map((id) => rolesService.delete(id)))
      const failed = results.filter((r) => r.status === 'rejected') as PromiseRejectedResult[]

      await useRoleListStore.getState().load()

      if (failed.length > 0) {
        const firstMessage = getApiMessage(failed[0].reason, 'No se pudieron eliminar los roles.')
        set({
          error: failed.length === ids.length
            ? firstMessage
            : `Se eliminaron ${ids.length - failed.length} de ${ids.length}. ${firstMessage}`,
        })
        return false
      }

      return true
    } catch (error: any) {
      set({ error: getApiMessage(error, 'No se pudieron eliminar los roles.') })
      return false
    } finally {
      set({ isLoading: false })
    }
  },
}))
