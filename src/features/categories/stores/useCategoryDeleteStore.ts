import { create } from 'zustand'
import { categoriesService } from '../services/categories.service'
import { useCategoryListStore } from './useCategoryListStore'
import { formatDatetime } from '@/shared/lib/utils'

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

export const useCategoryDeleteStore = create<State & Action>((set) => ({
  isLoading: false,
  error: null,

  toggleState: async (id, newState) => {
    set({ isLoading: true, error: null })
    try {
      const { items } = useCategoryListStore.getState()
      const item = items.find((i) => i.id === id)
      if (!item) throw new Error('Registro no encontrado')
      await categoriesService.put(id, {
        category_name: item.name,
        category_description: item.description ?? '',
        category_state: newState,
        category_updated_at: formatDatetime(),
      })
      await useCategoryListStore.getState().load()
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
      await categoriesService.delete(id)
      await useCategoryListStore.getState().load()
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
      const { items } = useCategoryListStore.getState()
      await Promise.all(
        ids.map((id) => {
          const item = items.find((i) => i.id === id)
          if (!item) return Promise.resolve()
          return categoriesService.put(id, {
            category_name: item.name,
            category_description: item.description ?? '',
            category_state: newState,
            category_updated_at: formatDatetime(),
          })
        })
      )
      await useCategoryListStore.getState().load()
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
      await Promise.all(ids.map((id) => categoriesService.delete(id)))
      await useCategoryListStore.getState().load()
      return true
    } catch {
      set({ error: 'No se pudieron eliminar los registros.' })
      return false
    } finally {
      set({ isLoading: false })
    }
  },
}))
