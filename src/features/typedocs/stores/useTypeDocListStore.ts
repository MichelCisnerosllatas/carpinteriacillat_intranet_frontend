import { create } from 'zustand'
import { typedocsService } from '../services/typedocs.service'
import { getStateOption } from '@/shared/config/entity-states'
import type { TypeDocListRequestDto, TypeDocApiItem } from '../model/typedocget.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { TypeDoc } from '../data/schema'

type State = {
  hasLoaded: boolean
  isInitialLoading: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  items: TypeDoc[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: TypeDocListRequestDto
  currentItem: TypeDoc | null
}

type Action = {
  load: (params?: TypeDocListRequestDto) => Promise<boolean>
  setCurrentItem: (item: TypeDoc | null) => void
  reset: () => void
}

const defaultFilters: TypeDocListRequestDto = {
  page: 1, per_page: 10, search: '', state: undefined, date_from: '', date_to: '',
}

const mapFromApi = (item: TypeDocApiItem): TypeDoc => {
  const stateOpt = getStateOption(item.typedoc_state)
  return {
    id: item.id_typedoc,
    name: item.typedoc_name,
    description: item.typedoc_description,
    status: item.typedoc_state === 1 ? 'active' : 'inactive',
    statusLabel: stateOpt.label,
    stateValue: item.typedoc_state,
    createdAt: item.typedoc_created_at,
    updatedAt: item.typedoc_updated_at ?? '',
  }
}

export const useTypeDocListStore = create<State & Action>((set, get) => ({
  hasLoaded: false, isInitialLoading: false, isFetching: false,
  isError: false, message: null, items: [], links: null, meta: null,
  filters: defaultFilters, currentItem: null,

  setCurrentItem: (item) => set({ currentItem: item }),

  load: async (params = {}) => {
    const nextFilters = { ...get().filters, ...params }
    set({ filters: nextFilters, isFetching: true, isError: false, message: null })
    try {
      const response = await typedocsService.getList(nextFilters)
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
