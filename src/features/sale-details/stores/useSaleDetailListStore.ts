import { create } from 'zustand'
import { saleDetailsService } from '../services/sale-details.service'
import type { SaleDetailListRequestDto, SaleDetailApiItem } from '../model/saledetailget.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { SaleDetail } from '../data/schema'

type State = {
  hasLoaded: boolean
  isInitialLoading: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  items: SaleDetail[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: SaleDetailListRequestDto
  currentItem: SaleDetail | null
  /** false = load() reutiliza los datos ya cargados (hasLoaded) en vez de pedirlos de nuevo. Por defecto true: la pantalla vuelve a pedir la lista cada vez que se entra a la ruta. */
  forceReload: boolean
}

type Action = {
  setForceReload: (value: boolean) => void
  load: (params?: SaleDetailListRequestDto) => Promise<boolean>
  loadBySale: (saleId: number) => Promise<boolean>
  setCurrentItem: (item: SaleDetail | null) => void
  reset: () => void
}

const defaultFilters: SaleDetailListRequestDto = { page: 1, per_page: 50, search: '', sale_id: undefined }

const mapFromApi = (item: SaleDetailApiItem): SaleDetail => ({
  id: item.id,
  saleId: item.sale_id,
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

export const useSaleDetailListStore = create<State & Action>((set, get) => ({
  hasLoaded: false, isInitialLoading: false, isFetching: false,
  isError: false, message: null, items: [], links: null, meta: null,
  filters: defaultFilters, currentItem: null,
  forceReload: true,

  setForceReload: (value) => set({ forceReload: value }),
  setCurrentItem: (item) => set({ currentItem: item }),

  load: async (params = {}) => {
    if (!get().forceReload && get().hasLoaded) return true
    const nextFilters = { ...get().filters, ...params }
    set({ filters: nextFilters, isFetching: true, isError: false, message: null })
    try {
      const response = await saleDetailsService.getList(nextFilters)
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

  // Atajo para traer las líneas sueltas de una venta específica.
  loadBySale: async (saleId) => {
    return get().load({ sale_id: saleId, page: 1, per_page: 100 })
  },

  reset: () => set({ hasLoaded: false, isInitialLoading: false, isFetching: false, isError: false, message: null, items: [], links: null, meta: null, filters: defaultFilters }),
}))
