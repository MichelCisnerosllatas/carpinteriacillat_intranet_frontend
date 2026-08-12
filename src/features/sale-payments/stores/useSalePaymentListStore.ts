import { create } from 'zustand'
import { salePaymentsService } from '../services/sale-payments.service'
import type { SalePaymentListRequestDto, SalePaymentApiItem } from '../model/salepaymentget.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { SalePayment } from '../data/schema'

type State = {
  hasLoaded: boolean
  isInitialLoading: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  items: SalePayment[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: SalePaymentListRequestDto
  forceReload: boolean
}

type Action = {
  setForceReload: (value: boolean) => void
  load: (params?: SalePaymentListRequestDto) => Promise<boolean>
  loadBySale: (saleId: number) => Promise<boolean>
  reset: () => void
}

const defaultFilters: SalePaymentListRequestDto = { page: 1, per_page: 50, sale_id: undefined }

const mapFromApi = (item: SalePaymentApiItem): SalePayment => ({
  id: item.id,
  saleId: item.sale_id,
  amount: Number(item.amount),
  paymentDate: item.payment_date,
  paymentMethod: item.payment_method,
  observation: item.observation,
  createdAt: item.created_at,
  updatedAt: item.updated_at ?? '',
})

export const useSalePaymentListStore = create<State & Action>((set, get) => ({
  hasLoaded: false, isInitialLoading: false, isFetching: false,
  isError: false, message: null, items: [], links: null, meta: null,
  filters: defaultFilters,
  forceReload: true,

  setForceReload: (value) => set({ forceReload: value }),

  load: async (params = {}) => {
    if (!get().forceReload && get().hasLoaded) return true
    const nextFilters = { ...get().filters, ...params }
    set({ filters: nextFilters, isFetching: true, isError: false, message: null })
    try {
      const response = await salePaymentsService.getList(nextFilters)
      if (!response.success) throw new Error(response.message)
      set({
        hasLoaded: true, isInitialLoading: false, isFetching: false, isError: false,
        message: response.message,
        items: response.data.map(mapFromApi),
        links: response.links, meta: response.meta,
        filters: { ...nextFilters, page: response.meta?.current_page ?? nextFilters.page, per_page: response.meta?.per_page ?? nextFilters.per_page },
      })
      return true
    } catch (error: any) {
      set({ hasLoaded: true, isInitialLoading: false, isFetching: false, isError: true, message: error?.response?.data?.message ?? error?.message ?? 'Error al cargar.' })
      return false
    }
  },

  // Atajo para traer los pagos sueltos de una venta específica.
  loadBySale: async (saleId) => {
    return get().load({ sale_id: saleId, page: 1, per_page: 100 })
  },

  reset: () => set({ hasLoaded: false, isInitialLoading: false, isFetching: false, isError: false, message: null, items: [], links: null, meta: null, filters: defaultFilters }),
}))
