// Acciones rápidas de la lista: activar/desactivar y eliminar, de una alerta o de varias
// seleccionadas a la vez (casillas de la tabla).

import { create } from 'zustand'
import { webAlertsService } from '../services/web-alerts.service'
import { useWebAlertListStore } from './useWebAlertListStore'

type State = {
  /** Id de la alerta que se está guardando ahora (para desactivar su interruptor mientras tanto). */
  loadingId: number | null
  error: string | null
}

type Action = {
  toggleState: (id: number, newState: number) => Promise<boolean>
  deleteItem: (id: number) => Promise<boolean>
  /** Activa (1) o desactiva (0) varias alertas a la vez. */
  bulkToggleState: (ids: number[], newState: number) => Promise<boolean>
  /** Elimina varias alertas a la vez. */
  bulkDeleteItems: (ids: number[]) => Promise<boolean>
}

export const useWebAlertDeleteStore = create<State & Action>((set) => ({
  loadingId: null,
  error: null,

  // Solo cambia el interruptor "Activada" (PATCH con un campo) y vuelve a pedir la lista
  toggleState: async (id, newState) => {
    set({ loadingId: id, error: null })
    try {
      await webAlertsService.patch(id, { webalert_state: newState })
      await useWebAlertListStore.getState().load()
      return true
    } catch (error: any) {
      set({ error: error?.response?.data?.message ?? 'No se pudo cambiar el estado.' })
      return false
    } finally {
      set({ loadingId: null })
    }
  },

  deleteItem: async (id) => {
    set({ loadingId: id, error: null })
    try {
      await webAlertsService.delete(id)
      await useWebAlertListStore.getState().load()
      return true
    } catch (error: any) {
      set({ error: error?.response?.data?.message ?? 'No se pudo eliminar la alerta.' })
      return false
    } finally {
      set({ loadingId: null })
    }
  },

  // Un PATCH por alerta (en paralelo) y luego se vuelve a pedir la lista.
  // Si alguno falla, igual se recarga para ver cuáles sí cambiaron.
  bulkToggleState: async (ids, newState) => {
    set({ error: null })
    try {
      await Promise.all(ids.map((id) => webAlertsService.patch(id, { webalert_state: newState })))
      await useWebAlertListStore.getState().load()
      return true
    } catch (error: any) {
      await useWebAlertListStore.getState().load()
      set({ error: error?.response?.data?.message ?? 'No se pudieron actualizar todas las alertas.' })
      return false
    }
  },

  bulkDeleteItems: async (ids) => {
    set({ error: null })
    try {
      await Promise.all(ids.map((id) => webAlertsService.delete(id)))
      await useWebAlertListStore.getState().load()
      return true
    } catch (error: any) {
      await useWebAlertListStore.getState().load()
      set({ error: error?.response?.data?.message ?? 'No se pudieron eliminar todas las alertas.' })
      return false
    }
  },
}))
