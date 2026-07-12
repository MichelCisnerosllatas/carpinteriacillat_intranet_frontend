import { create } from 'zustand'
import { typefontsService } from '../services/typefonts.service'
import { getStateOption } from '@/shared/config/entity-states'
import type { TypeFontListRequestDto, TypeFontApiItem } from '../model/typefontget.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { TypeFont } from '../data/schema'

type State = {
  hasLoaded: boolean
  isInitialLoading: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  items: TypeFont[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: TypeFontListRequestDto
  currentItem: TypeFont | null
}

type Action = {
  load: (params?: TypeFontListRequestDto) => Promise<boolean>
  setCurrentItem: (item: TypeFont | null) => void
  reset: () => void
}

const defaultFilters: TypeFontListRequestDto = {
  page: 1, per_page: 10, search: '', state: undefined, date_from: '', date_to: '',
}

const mapFromApi = (item: TypeFontApiItem): TypeFont => {
  const stateOpt = getStateOption(item.typefont_state)
  return {
    id: item.id_typefont,
    name: item.typefont_name,
    description: item.typefont_description,
    status: item.typefont_state === 1 ? 'active' : 'inactive',
    statusLabel: stateOpt.label,
    stateValue: item.typefont_state,
    createdAt: item.typefont_created_at,
    updatedAt: item.typefont_updated_at ?? '',
  }
}

export const useTypeFontListStore = create<State & Action>((set, get) => ({
  hasLoaded: false, isInitialLoading: false, isFetching: false,
  isError: false, message: null, items: [], links: null, meta: null,
  filters: defaultFilters, currentItem: null,

  setCurrentItem: (item) => set({ currentItem: item }),

  load: async (params = {}) => {
    if (get().isFetching) return false
    const nextFilters = { ...get().filters, ...params }
    set({ filters: nextFilters, isFetching: true, isError: false, message: null })
    try {
      const response = await typefontsService.getList(nextFilters)
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
