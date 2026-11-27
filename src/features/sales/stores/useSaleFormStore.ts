import { create } from 'zustand'
import { salesService } from '../services/sales.service'
import type { SaleFullPostRequestDto, SaleFullPutRequestDto } from '../model/salefull.dto'
import type { Sale } from '../data/schema'
import { mapSaleFromApi } from './useSaleListStore'

type State = {
  isSubmitting: boolean
  error: string | null
  /** Errores 422 por campo, con las claves tal cual las manda Laravel ("client_id",
   * "details.0.discount", "payments"...). La pantalla los pinta junto a cada campo. */
  fieldErrors: Record<string, string[]> | null
}

type Action = {
  /** POST /sales/full — devuelve la venta creada (o null si falló). */
  createFull: (params: SaleFullPostRequestDto) => Promise<Sale | null>
  /** PUT /sales/{id}/full — devuelve la venta actualizada (o null si falló). */
  updateFull: (id: number, params: SaleFullPutRequestDto) => Promise<Sale | null>
  reset: () => void
}

// Lee el mensaje y los errores de campo de una respuesta fallida de Axios.
const readError = (error: any, fallback: string) => ({
  error: error?.response?.data?.message ?? error?.message ?? fallback,
  fieldErrors: error?.response?.data?.errors ?? null,
})

export const useSaleFormStore = create<State & Action>((set) => ({
  isSubmitting: false,
  error: null,
  fieldErrors: null,

  createFull: async (params) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const res = await salesService.postFull(params)
      if (!res.success) {
        set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null })
        return null
      }
      set({ isSubmitting: false })
      return mapSaleFromApi(res.data)
    } catch (error: any) {
      set({ isSubmitting: false, ...readError(error, 'No se pudo registrar la venta.') })
      return null
    }
  },

  updateFull: async (id, params) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const res = await salesService.putFull(id, params)
      if (!res.success) {
        set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null })
        return null
      }
      set({ isSubmitting: false })
      return mapSaleFromApi(res.data)
    } catch (error: any) {
      set({ isSubmitting: false, ...readError(error, 'No se pudo guardar la venta.') })
      return null
    }
  },

  reset: () => set({ isSubmitting: false, error: null, fieldErrors: null }),
}))
