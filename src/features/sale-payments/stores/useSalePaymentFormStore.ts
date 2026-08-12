import { create } from 'zustand'
import { salePaymentsService } from '../services/sale-payments.service'
import { useSalePaymentListStore } from './useSalePaymentListStore'
import { useSaleListStore } from '@/features/sales'
import type { SalePaymentPostRequestDto } from '../model/salepaymentpost.dto'
import type { SalePaymentPutRequestDto } from '../model/salepaymentput.dto'

type State = {
  isSubmitting: boolean
  error: string | null
  fieldErrors: Record<string, string[]> | null
}

type Action = {
  create: (params: SalePaymentPostRequestDto) => Promise<boolean>
  update: (id: number, saleId: number, data: SalePaymentPutRequestDto) => Promise<boolean>
  reset: () => void
}

/**
 * `amount_paid`/`balance`/`payment_status` de la venta padre se recalculan en el servidor con
 * cada alta/edición de un pago (ver sale-payments.md) — por eso, además de refrescar la lista de
 * pagos (`useSalePaymentListStore`), también se refresca la venta en `useSaleListStore` (vía
 * `loadOne`) para que `sale-detail.tsx` muestre esos totales actualizados sin recargar la
 * página.
 */
export const useSalePaymentFormStore = create<State & Action>((set) => ({
  isSubmitting: false, error: null, fieldErrors: null,

  create: async (params) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const res = await salePaymentsService.post(params)
      if (!res.success) { set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null }); return false }
      await Promise.all([
        useSalePaymentListStore.getState().loadBySale(params.sale_id),
        useSaleListStore.getState().loadOne(params.sale_id),
      ])
      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      set({ isSubmitting: false, error: error?.response?.data?.message ?? error?.message ?? 'Error al crear.', fieldErrors: error?.response?.data?.errors ?? null })
      return false
    }
  },

  update: async (id, saleId, data) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const res = await salePaymentsService.patch(id, data)
      if (!res.success) { set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null }); return false }
      await Promise.all([
        useSalePaymentListStore.getState().loadBySale(saleId),
        useSaleListStore.getState().loadOne(saleId),
      ])
      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      set({ isSubmitting: false, error: error?.response?.data?.message ?? error?.message ?? 'Error al actualizar.', fieldErrors: error?.response?.data?.errors ?? null })
      return false
    }
  },

  reset: () => set({ isSubmitting: false, error: null, fieldErrors: null }),
}))
