import { create } from 'zustand'
import { typewoodsService } from '../services/typewoods.service'
import { getStateOption } from '@/shared/config/entity-states'
import type { TypeWoodListRequestDto, TypeWoodApiItem } from '../model/typewoodget.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { TypeWood } from '../data/schema'

type State = {
  hasLoaded: boolean
  isInitialLoading: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  items: TypeWood[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: TypeWoodListRequestDto
  currentItem: TypeWood | null
}

type Action = {
  load: (params?: TypeWoodListRequestDto) => Promise<boolean>
  setCurrentItem: (item: TypeWood | null) => void
  reset: () => void
}

const defaultFilters: TypeWoodListRequestDto = {
  page: 1, per_page: 10, search: '', state: undefined, date_from: '', date_to: '',
}

const mapFromApi = (item: TypeWoodApiItem): TypeWood => {
  const stateOpt = getStateOption(item.typewood_state)
  return {
    id: item.id_typewood,
    name: item.typewood_name,
    description: item.typewood_description,
    status: item.typewood_state === 1 ? 'active' : 'inactive',
    statusLabel: stateOpt.label,
    stateValue: item.typewood_state,
    createdAt: item.typewood_created_at,
    updatedAt: item.typewood_updated_at ?? '',
  }
}

export const useTypeWoodListStore = create<State & Action>((set, get) => ({
  hasLoaded: false, isInitialLoading: false, isFetching: false,
  isError: false, message: null, items: [], links: null, meta: null,
  filters: defaultFilters, currentItem: null,

  setCurrentItem: (item) => set({ currentItem: item }),

  load: async (params = {}) => {
    if (get().isFetching) return false
    const nextFilters = { ...get().filters, ...params }
    set({ filters: nextFilters, isFetching: true, isError: false, message: null })
    try {
      const response = await typewoodsService.getList(nextFilters)
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
