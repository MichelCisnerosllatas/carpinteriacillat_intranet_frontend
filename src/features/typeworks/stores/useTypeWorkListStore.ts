import { create } from 'zustand'
import { typeworksService } from '../services/typeworks.service'
import { getStateOption } from '@/shared/config/entity-states'
import type { TypeWorkListRequestDto, TypeWorkApiItem } from '../model/typeworkget.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { TypeWork } from '../data/schema'

type State = {
  hasLoaded: boolean
  isInitialLoading: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  items: TypeWork[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: TypeWorkListRequestDto
  currentItem: TypeWork | null
  /** false = load() reutiliza los datos ya cargados (hasLoaded) en vez de pedirlos de nuevo. Por defecto true: la pantalla vuelve a pedir la lista cada vez que se entra a la ruta. */
  forceReload: boolean
}

type Action = {
  setForceReload: (value: boolean) => void
  load: (params?: TypeWorkListRequestDto) => Promise<boolean>
  setCurrentItem: (item: TypeWork | null) => void
  reset: () => void
}

const defaultFilters: TypeWorkListRequestDto = {
  page: 1, per_page: 10, search: '', state: undefined, date_from: '', date_to: '',
}

const mapFromApi = (item: TypeWorkApiItem): TypeWork => {
  const stateOpt = getStateOption(item.typework_state)
  return {
    id: item.id_typework,
    key: item.typework_key,
    name: item.typework_name,
    description: item.typework_description,
    status: item.typework_state === 1 ? 'active' : 'inactive',
    statusLabel: stateOpt.label,
    stateValue: item.typework_state,
    webWorksCount: item.web_works_count ?? 0,
    createdAt: item.typework_created_at,
    updatedAt: item.typework_updated_at ?? '',
  }
}

export const useTypeWorkListStore = create<State & Action>((set, get) => ({
  hasLoaded: false, isInitialLoading: false, isFetching: false,
  isError: false, message: null, items: [], links: null, meta: null,
  filters: defaultFilters, currentItem: null,
  forceReload: true,

  setForceReload: (value) => set({ forceReload: value }),
  setCurrentItem: (item) => set({ currentItem: item }),

  load: async (params = {}) => {
    if (get().isFetching) return false
    if (!get().forceReload && get().hasLoaded) return true
    const nextFilters = { ...get().filters, ...params }
    set({ filters: nextFilters, isFetching: true })
    try {
      const response = await typeworksService.getList(nextFilters)
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
