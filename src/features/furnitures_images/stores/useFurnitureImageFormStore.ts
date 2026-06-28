import { create } from 'zustand'
import { furnitureImagesService } from '../services/furnitures-images.service'
import { formatDatetime } from '@/shared/lib/utils'
import { useFurnitureImageListStore } from './useFurnitureImageListStore'
import type { FurnitureImagePostRequestDto } from '../model/furnitures-image-post.dto'
import type { FurnitureImagePutRequestDto } from '../model/furnitures-image-put.dto'

type State = {
  isSubmitting: boolean
  error: string | null
  fieldErrors: Record<string, string[]> | null
}

type BulkCreateItem   = { imageId: number; order: number }
type BulkReorderItem  = { furnitureImageId: number; order: number }

type Action = {
  create: (params: FurnitureImagePostRequestDto) => Promise<number | null>
  update: (id: number, data: Partial<FurnitureImagePutRequestDto>) => Promise<boolean>
  toggleState: (id: number, newState: number) => Promise<boolean>
  remove: (id: number) => Promise<boolean>
  bulkCreate: (furnitureId: number, items: BulkCreateItem[]) => Promise<boolean>
  bulkReorder: (items: BulkReorderItem[]) => Promise<boolean>
  bulkRemove: (ids: number[]) => Promise<boolean>
  reset: () => void
}

export const useFurnitureImageFormStore = create<State & Action>((set) => ({
  isSubmitting: false,
  error: null,
  fieldErrors: null,

  create: async (params) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const res = await furnitureImagesService.post({
        ...params,
        furnitureimage_created_at: formatDatetime(),
      })
      if (!res.success) throw new Error(res.message)
      await useFurnitureImageListStore.getState().load()
      set({ isSubmitting: false })
      return res.data.id_furniture_image
    } catch (error: any) {
      const apiErrors = error?.response?.data?.errors ?? null
      set({
        isSubmitting: false,
        error: error?.response?.data?.message ?? error?.message ?? 'Error al crear.',
        fieldErrors: apiErrors,
      })
      return null
    }
  },

  update: async (id, data) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const payload: Partial<FurnitureImagePutRequestDto> = {
        ...data,
        furnitureimage_updated_at: formatDatetime(),
      }
      await furnitureImagesService.patch(id, payload)
      await useFurnitureImageListStore.getState().load()
      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      const apiErrors = error?.response?.data?.errors ?? null
      set({
        isSubmitting: false,
        error: error?.response?.data?.message ?? error?.message ?? 'Error al actualizar.',
        fieldErrors: apiErrors,
      })
      return false
    }
  },

  toggleState: async (id, newState) => {
    set({ isSubmitting: true, error: null })
    try {
      await furnitureImagesService.patch(id, { furnitureimage_state: newState })
      await useFurnitureImageListStore.getState().load()
      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      set({ isSubmitting: false, error: error?.response?.data?.message ?? 'No se pudo cambiar el estado.' })
      return false
    }
  },

  remove: async (id) => {
    set({ isSubmitting: true, error: null })
    try {
      await furnitureImagesService.delete(id)
      await useFurnitureImageListStore.getState().load()
      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      set({ isSubmitting: false, error: error?.response?.data?.message ?? 'No se pudo eliminar.' })
      return false
    }
  },

  bulkCreate: async (furnitureId, items) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      for (const item of items) {
        await furnitureImagesService.post({
          id_furniture: furnitureId,
          id_image: item.imageId,
          furnitureimage_order: item.order,
          furnitureimage_state: 1,
          furnitureimage_created_at: formatDatetime(),
        })
      }
      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      set({
        isSubmitting: false,
        error: error?.response?.data?.message ?? error?.message ?? 'Error al guardar imágenes de galería.',
      })
      return false
    }
  },

  bulkReorder: async (items) => {
    set({ isSubmitting: true, error: null })
    try {
      await Promise.all(
        items.map((item) =>
          furnitureImagesService.patch(item.furnitureImageId, {
            furnitureimage_order: item.order,
            furnitureimage_updated_at: formatDatetime(),
          })
        )
      )
      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      set({ isSubmitting: false, error: error?.response?.data?.message ?? 'Error al reordenar imágenes.' })
      return false
    }
  },

  bulkRemove: async (ids) => {
    set({ isSubmitting: true, error: null })
    try {
      await Promise.all(ids.map((id) => furnitureImagesService.delete(id)))
      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      set({ isSubmitting: false, error: error?.response?.data?.message ?? 'Error al eliminar imágenes de galería.' })
      return false
    }
  },

  reset: () => set({ isSubmitting: false, error: null, fieldErrors: null }),
}))
