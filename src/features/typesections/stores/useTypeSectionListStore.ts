import { create } from 'zustand'
import { typesectionsService } from '../services/typesections.service'
import { getStateOption } from '@/shared/config/entity-states'
import type { TypeSectionListRequestDto, TypeSectionApiItem } from '../model/typesectionget.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { TypeSection } from '../data/schema'

type State = {
  hasLoaded: boolean
  isInitialLoading: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  items: TypeSection[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: TypeSectionListRequestDto
  currentItem: TypeSection | null
}

type Action = {
  load: (params?: TypeSectionListRequestDto) => Promise<boolean>
  setCurrentItem: (item: TypeSection | null) => void
  reset: () => void
}

const defaultFilters: TypeSectionListRequestDto = {
  page: 1, per_page: 10, search: '', state: undefined, date_from: '', date_to: '',
}

const mapFromApi = (item: TypeSectionApiItem): TypeSection => {
  const stateOpt = getStateOption(item.typesection_state)
  return {
    id: item.id_typesection,
    name: item.typesection_name,
    description: item.typesection_description,
    status: item.typesection_state === 1 ? 'active' : 'inactive',
    statusLabel: stateOpt.label,
    stateValue: item.typesection_state,
    createdAt: item.typesection_created_at,
    updatedAt: item.typesection_updated_at ?? '',
  }
}

export const useTypeSectionListStore = create<State & Action>((set, get) => ({
  hasLoaded: false, isInitialLoading: false, isFetching: false,
  isError: false, message: null, items: [], links: null, meta: null,
  filters: defaultFilters, currentItem: null,

  setCurrentItem: (item) => set({ currentItem: item }),

  load: async (params = {}) => {
    if (get().isFetching) return false
    const nextFilters = { ...get().filters, ...params }
    set({ filters: nextFilters, isFetching: true, isError: false, message: null })
    try {
      const response = await typesectionsService.getList(nextFilters)
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
