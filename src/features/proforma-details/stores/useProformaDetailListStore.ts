import { create } from 'zustand'
import { proformaDetailsService } from '../services/proforma-details.service'
import type { ProformaDetailListRequestDto, ProformaDetailApiItem } from '../model/proformadetailget.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { ProformaDetail } from '../data/schema'

type State = {
  hasLoaded: boolean
  isInitialLoading: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  items: ProformaDetail[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: ProformaDetailListRequestDto
  currentItem: ProformaDetail | null
}

type Action = {
  load: (params?: ProformaDetailListRequestDto) => Promise<boolean>
  loadByProforma: (proformaId: number) => Promise<boolean>
  setCurrentItem: (item: ProformaDetail | null) => void
  reset: () => void
}

const defaultFilters: ProformaDetailListRequestDto = { page: 1, per_page: 50, search: '', proforma_id: undefined }

const mapFromApi = (item: ProformaDetailApiItem): ProformaDetail => ({
  id: item.id,
  proformaId: item.proforma_id,
  productServiceId: item.product_service_id,
  description: item.description,
  unit: item.unit,
  quantity: Number(item.quantity),
  unitPrice: Number(item.unit_price),
  subtotal: Number(item.subtotal),
  tax: item.tax !== null ? Number(item.tax) : null,
  total: Number(item.total),
  order: item.order,
  createdAt: item.created_at,
  updatedAt: item.updated_at ?? '',
})

export const useProformaDetailListStore = create<State & Action>((set, get) => ({
  hasLoaded: false, isInitialLoading: false, isFetching: false,
  isError: false, message: null, items: [], links: null, meta: null,
  filters: defaultFilters, currentItem: null,

  setCurrentItem: (item) => set({ currentItem: item }),

  load: async (params = {}) => {
    const nextFilters = { ...get().filters, ...params }
    set({ filters: nextFilters, isFetching: true, isError: false, message: null })
    try {
      const response = await proformaDetailsService.getList(nextFilters)
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

  // Atajo para traer las líneas sueltas de una proforma específica.
  loadByProforma: async (proformaId) => {
    return get().load({ proforma_id: proformaId, page: 1, per_page: 100 })
  },

  reset: () => set({ hasLoaded: false, isInitialLoading: false, isFetching: false, isError: false, message: null, items: [], links: null, meta: null, filters: defaultFilters }),
}))
