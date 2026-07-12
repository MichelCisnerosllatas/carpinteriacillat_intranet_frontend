import { create } from 'zustand'
import { proformaTypesService } from '../services/proforma-types.service'
import { getStateOption } from '@/shared/config/entity-states'
import type { ProformaTypeListRequestDto, ProformaTypeApiItem } from '../model/proformatypeget.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { ProformaType } from '../data/schema'

type State = {
  hasLoaded: boolean
  isInitialLoading: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  items: ProformaType[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: ProformaTypeListRequestDto
  currentItem: ProformaType | null
}

type Action = {
  load: (params?: ProformaTypeListRequestDto) => Promise<boolean>
  setCurrentItem: (item: ProformaType | null) => void
  reset: () => void
}

const defaultFilters: ProformaTypeListRequestDto = {
  page: 1, per_page: 10, search: '', status: undefined,
}

const mapFromApi = (item: ProformaTypeApiItem): ProformaType => {
  const stateOpt = getStateOption(item.status)
  return {
    id: item.id,
    name: item.name,
    code: item.code,
    status: item.status === 1 ? 'active' : 'inactive',
    statusLabel: stateOpt.label,
    stateValue: item.status,
    createdAt: item.created_at,
    updatedAt: item.updated_at ?? '',
  }
}

export const useProformaTypeListStore = create<State & Action>((set, get) => ({
  hasLoaded: false, isInitialLoading: false, isFetching: false,
  isError: false, message: null, items: [], links: null, meta: null,
  filters: defaultFilters, currentItem: null,

  setCurrentItem: (item) => set({ currentItem: item }),

  load: async (params = {}) => {
    if (get().isFetching) return false
    const nextFilters = { ...get().filters, ...params }
    set({ filters: nextFilters, isFetching: true, isError: false, message: null })
    try {
      const response = await proformaTypesService.getList(nextFilters)
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
