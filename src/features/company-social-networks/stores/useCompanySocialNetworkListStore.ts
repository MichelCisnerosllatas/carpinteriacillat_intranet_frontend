import { create } from 'zustand'
import { companySocialNetworksService } from '../services/company-social-networks.service'
import { getStateOption } from '@/shared/config/entity-states'
import type { CompanySocialNetworkListRequestDto, CompanySocialNetworkApiItem } from '../model/companysocialnetworkget.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { CompanySocialNetwork } from '../data/schema'

type State = {
  hasLoaded: boolean
  isInitialLoading: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  items: CompanySocialNetwork[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: CompanySocialNetworkListRequestDto
  currentItem: CompanySocialNetwork | null
}

type Action = {
  load: (params?: CompanySocialNetworkListRequestDto) => Promise<boolean>
  setCurrentItem: (item: CompanySocialNetwork | null) => void
  reset: () => void
}

const defaultFilters: CompanySocialNetworkListRequestDto = {
  page: 1, per_page: 10, search: '', status: undefined, show_on_website: undefined,
}

const mapFromApi = (item: CompanySocialNetworkApiItem): CompanySocialNetwork => {
  const stateOpt = getStateOption(item.status)
  return {
    id: item.id,
    name: item.name,
    link: item.link,
    showOnWebsite: item.show_on_website,
    order: item.order,
    status: item.status === 1 ? 'active' : 'inactive',
    statusLabel: stateOpt.label,
    statusValue: item.status,
    createdAt: item.created_at,
    updatedAt: item.updated_at ?? '',
  }
}

export const useCompanySocialNetworkListStore = create<State & Action>((set, get) => ({
  hasLoaded: false, isInitialLoading: false, isFetching: false,
  isError: false, message: null, items: [], links: null, meta: null,
  filters: defaultFilters, currentItem: null,

  setCurrentItem: (item) => set({ currentItem: item }),

  load: async (params = {}) => {
    if (get().isFetching) return false
    const nextFilters = { ...get().filters, ...params }
    set({ filters: nextFilters, isFetching: true, isError: false, message: null })
    try {
      const response = await companySocialNetworksService.getList(nextFilters)
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
