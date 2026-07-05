import { create } from 'zustand'
import { productsServicesService } from '../services/products-services.service'
import { getStateOption } from '@/shared/config/entity-states'
import type { ProductServiceListRequestDto } from '../model/productserviceget.dto'
import type { ProductServiceJoinApiItem } from '../model/product-service-api-item.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { ProductService } from '../data/schema'

type State = {
  hasLoaded: boolean
  isInitialLoading: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  items: ProductService[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: ProductServiceListRequestDto
  currentItem: ProductService | null
}

type Action = {
  load: (params?: ProductServiceListRequestDto) => Promise<boolean>
  loadById: (id: number) => Promise<boolean>
  setCurrentItem: (item: ProductService | null) => void
  reset: () => void
}

const defaultFilters: ProductServiceListRequestDto = {
  page: 1, per_page: 10, search: '', type: undefined, status: undefined,
}

const mapFromApi = (item: ProductServiceJoinApiItem): ProductService => {
  const stateOpt = getStateOption(item.status)
  return {
    id: item.id,
    furnitureId: item.furniture_id,
    furnitureName: item.furniture?.furniture_name ?? null,
    name: item.name,
    description: item.description,
    unit: item.unit,
    defaultPrice: Number(item.default_price),
    type: item.type,
    status: item.status === 1 ? 'active' : 'inactive',
    statusLabel: stateOpt.label,
    stateValue: item.status,
    createdAt: item.created_at,
    updatedAt: item.updated_at ?? '',
  }
}

export const useProductServiceListStore = create<State & Action>((set, get) => ({
  hasLoaded: false, isInitialLoading: false, isFetching: false,
  isError: false, message: null, items: [], links: null, meta: null,
  filters: defaultFilters, currentItem: null,

  setCurrentItem: (item) => set({ currentItem: item }),

  loadById: async (id) => {
    set({ isFetching: true, isError: false, message: null })
    try {
      const response = await productsServicesService.getById(id)
      if (!response.success) throw new Error(response.message)
      const mapped = mapFromApi(response.data)
      set({ isFetching: false, currentItem: mapped, hasLoaded: true })
      return true
    } catch (error: any) {
      set({ isFetching: false, isError: true, message: error?.response?.data?.message ?? error?.message ?? 'Error al cargar.' })
      return false
    }
  },

  load: async (params = {}) => {
    const nextFilters = { ...get().filters, ...params }
    set({ filters: nextFilters, isFetching: true, isError: false, message: null })
    try {
      const response = await productsServicesService.getList(nextFilters)
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

  reset: () => set({ hasLoaded: false, isInitialLoading: false, isFetching: false, isError: false, message: null, items: [], links: null, meta: null, filters: defaultFilters }),
}))
