import { create } from 'zustand'
import { salesService } from '../services/sales.service'
import { useSaleListStore } from './useSaleListStore'
import type { SaleStatus } from '../data/schema'

type State = {
  isLoading: boolean
  error: string | null
}

type Action = {
  changeStatus: (id: number, newStatus: SaleStatus) => Promise<boolean>
  deleteItem: (id: number) => Promise<boolean>
  bulkDeleteItems: (ids: number[]) => Promise<boolean>
}

// payment_status NUNCA se cambia desde acá — es 100% de solo lectura (ver data/data.ts,
// SALE_PAYMENT_STATUS_OPTIONS no tiene transiciones). Solo `status` (el ciclo de vida del
// documento) es editable, y solo por cambio de estado explícito, nunca desde el form general.
export const useSaleDeleteStore = create<State & Action>((set) => ({
  isLoading: false,
  error: null,

  changeStatus: async (id, newStatus) => {
    set({ isLoading: true, error: null })
    try {
      await salesService.patch(id, { status: newStatus })
      await useSaleListStore.getState().load()
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
      await salesService.delete(id)
      await useSaleListStore.getState().load()
      return true
    } catch {
      set({ error: 'No se pudo eliminar el registro.' })
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  bulkDeleteItems: async (ids) => {
    set({ isLoading: true, error: null })
    try {
      await Promise.all(ids.map((id) => salesService.delete(id)))
      await useSaleListStore.getState().load()
      return true
    } catch {
      set({ error: 'No se pudieron eliminar los registros.' })
      return false
    } finally {
      set({ isLoading: false })
    }
  },
}))
