import { create } from 'zustand'
import { imagesService } from '../services/images.service'
import { useImageListStore } from './useImageListStore'

type State = {
  isLoading: boolean
  error: string | null
}

type Action = {
  deleteItem: (id: number) => Promise<boolean>
  bulkDeleteItems: (ids: number[]) => Promise<boolean>
}

export const useImageDeleteStore = create<State & Action>((set) => ({
  isLoading: false,
  error: null,

  deleteItem: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await imagesService.delete(id)
      await useImageListStore.getState().load()
      return true
    } catch {
      set({ error: 'No se pudo eliminar la imagen.' })
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  bulkDeleteItems: async (ids) => {
    set({ isLoading: true, error: null })
    try {
      await Promise.all(ids.map((id) => imagesService.delete(id)))
      await useImageListStore.getState().load()
      return true
    } catch {
      set({ error: 'No se pudieron eliminar las imágenes.' })
      return false
    } finally {
      set({ isLoading: false })
    }
  },
}))
