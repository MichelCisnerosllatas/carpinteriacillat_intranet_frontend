import { create } from 'zustand'
import { typecolorsService } from '../services/typecolors.service'
import { getStateOption } from '@/shared/config/entity-states'
import type { TypeColorListRequestDto, TypeColorApiItem } from '../model/typecolorget.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { TypeColor } from '../data/schema'

type State = {
  hasLoaded: boolean
  isInitialLoading: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  items: TypeColor[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: TypeColorListRequestDto
  currentItem: TypeColor | null
}

type Action = {
  load: (params?: TypeColorListRequestDto) => Promise<boolean>
  setCurrentItem: (item: TypeColor | null) => void
  reset: () => void
}

const defaultFilters: TypeColorListRequestDto = {
  page: 1, per_page: 10, search: '', state: undefined, date_from: '', date_to: '',
}

const mapFromApi = (item: TypeColorApiItem): TypeColor => {
  const stateOpt = getStateOption(item.typecolor_state)
  return {
    id: item.id_typecolor,
    name: item.typecolor_name,
    description: item.typecolor_description,
    status: item.typecolor_state === 1 ? 'active' : 'inactive',
    statusLabel: stateOpt.label,
    stateValue: item.typecolor_state,
    createdAt: item.typecolor_created_at,
    updatedAt: item.typecolor_updated_at ?? '',
  }
}

export const useTypeColorListStore = create<State & Action>((set, get) => ({
  hasLoaded: false, isInitialLoading: false, isFetching: false,
  isError: false, message: null, items: [], links: null, meta: null,
  filters: defaultFilters, currentItem: null,

  setCurrentItem: (item) => set({ currentItem: item }),

  load: async (params = {}) => {
    const nextFilters = { ...get().filters, ...params }
    set({ filters: nextFilters, isFetching: true, isError: false, message: null })
    try {
      const response = await typecolorsService.getList(nextFilters)
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
