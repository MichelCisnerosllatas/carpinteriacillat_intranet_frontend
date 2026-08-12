import { create } from 'zustand'
import { salePaymentsService } from '../services/sale-payments.service'
import { useSalePaymentListStore } from './useSalePaymentListStore'
import { useSaleListStore } from '@/features/sales'

type State = {
  isLoading: boolean
  error: string | null
}

type Action = {
  deleteItem: (id: number, saleId: number) => Promise<boolean>
}

export const useSalePaymentDeleteStore = create<State & Action>((set) => ({
  isLoading: false,
  error: null,

  deleteItem: async (id, saleId) => {
    set({ isLoading: true, error: null })
    try {
      await salePaymentsService.delete(id)
      await Promise.all([
        useSalePaymentListStore.getState().loadBySale(saleId),
        useSaleListStore.getState().loadOne(saleId),
      ])
      return true
    } catch {
      set({ error: 'No se pudo eliminar el pago.' })
      return false
    } finally {
      set({ isLoading: false })
    }
  },
}))
