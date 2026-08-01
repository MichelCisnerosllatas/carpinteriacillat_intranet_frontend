import { create } from 'zustand'
import { productsServicesService } from '../services/products-services.service'
import type { ProductServicePostRequestDto } from '../model/productservicepost.dto'
import type { ProductServicePutRequestDto } from '../model/productserviceput.dto'
import type { ProductServiceApiItem } from '../model/product-service-api-item.dto'
import { useProductServiceListStore } from '@/features/products-services/stores/useProductServiceListStore'

type State = {
  isSubmitting: boolean
  error: string | null
  fieldErrors: Record<string, string[]> | null
}

type Action = {
  /** Devuelve el ítem creado (para poder usarlo de inmediato, ej. autoseleccionarlo) o null si falló. */
  create: (params: ProductServicePostRequestDto) => Promise<ProductServiceApiItem | null>
  update: (id: number, data: ProductServicePutRequestDto) => Promise<boolean>
  reset: () => void
}

export const useProductServiceFormStore = create<State & Action>((set) => ({
  isSubmitting: false,
  error: null,
  fieldErrors: null,

  create: async (params) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const res = await productsServicesService.post(params)
      if (!res.success) {
        set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null })
        return null
      }
      await useProductServiceListStore.getState().load()
      set({ isSubmitting: false })
      return res.data
    } catch (error: any) {
      set({
        isSubmitting: false,
        error: error?.response?.data?.message ?? error?.message ?? 'Error al crear.',
        fieldErrors: error?.response?.data?.errors ?? null,
      })
      return null
    }
  },

  update: async (id, data) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const res = await productsServicesService.patch(id, data)
      if (!res.success) {
        set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null })
        return false
      }
      await useProductServiceListStore.getState().load()
      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      set({
        isSubmitting: false,
        error: error?.response?.data?.message ?? error?.message ?? 'Error al actualizar.',
        fieldErrors: error?.response?.data?.errors ?? null,
      })
      return false
    }
  },

  reset: () => set({ isSubmitting: false, error: null, fieldErrors: null }),
}))
