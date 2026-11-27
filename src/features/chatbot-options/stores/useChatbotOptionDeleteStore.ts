// Acciones rápidas de la lista: activar/desactivar y eliminar (una o varias).

import { create } from 'zustand'
import { chatbotOptionsService } from '../services/chatbot-options.service'
import { useChatbotOptionListStore } from './useChatbotOptionListStore'

type State = {
  loadingId: number | null
  error: string | null
}

type Action = {
  toggleState: (id: number, newState: boolean) => Promise<boolean>
  deleteItem: (id: number) => Promise<boolean>
  bulkToggleState: (ids: number[], newState: boolean) => Promise<boolean>
  bulkDeleteItems: (ids: number[]) => Promise<boolean>
}

export const useChatbotOptionDeleteStore = create<State & Action>((set) => ({
  loadingId: null,
  error: null,

  toggleState: async (id, newState) => {
    set({ loadingId: id, error: null })
    try {
      await chatbotOptionsService.patch(id, { state: newState })
      await useChatbotOptionListStore.getState().load()
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
      await chatbotOptionsService.delete(id)
      await useChatbotOptionListStore.getState().load()
      return true
    } catch (error: any) {
      set({ error: error?.response?.data?.message ?? 'No se pudo eliminar la opción.' })
      return false
    } finally {
      set({ loadingId: null })
    }
  },

  bulkToggleState: async (ids, newState) => {
    set({ error: null })
    try {
      await Promise.all(ids.map((id) => chatbotOptionsService.patch(id, { state: newState })))
      await useChatbotOptionListStore.getState().load()
      return true
    } catch (error: any) {
      await useChatbotOptionListStore.getState().load()
      set({ error: error?.response?.data?.message ?? 'No se pudieron actualizar todas las opciones.' })
      return false
    }
  },

  bulkDeleteItems: async (ids) => {
    set({ error: null })
    try {
      await Promise.all(ids.map((id) => chatbotOptionsService.delete(id)))
      await useChatbotOptionListStore.getState().load()
      return true
    } catch (error: any) {
      await useChatbotOptionListStore.getState().load()
      set({ error: error?.response?.data?.message ?? 'No se pudieron eliminar todas las opciones.' })
      return false
    }
  },
}))
