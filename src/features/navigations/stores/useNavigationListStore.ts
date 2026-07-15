import { create } from 'zustand'
import { navigationsService } from '../services/navigations.service'
import { getStateOption } from '@/shared/config/entity-states'
import type { NavigationListRequestDto, NavigationApiItem } from '../model/navigationget.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { Navigation } from '../data/schema'

type State = {
  hasLoaded: boolean
  isInitialLoading: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  items: Navigation[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: NavigationListRequestDto
  currentItem: Navigation | null
  /** false = load() reutiliza los datos ya cargados (hasLoaded) en vez de pedirlos de nuevo. Por defecto true: la pantalla vuelve a pedir la lista cada vez que se entra a la ruta. */
  forceReload: boolean
}

type Action = {
  setForceReload: (value: boolean) => void
  load: (params?: NavigationListRequestDto) => Promise<boolean>
  setCurrentItem: (item: Navigation | null) => void
  reset: () => void
}

const defaultFilters: NavigationListRequestDto = { page: 1, per_page: 10, search: '', state: undefined }

const mapFromApi = (item: NavigationApiItem): Navigation => {
  const stateOpt = getStateOption(item.navigation_state)
  return {
    id: item.id_navigation,
    name: item.navigation_name,
    url: item.navigation_url,
    order: item.navigation_order,
    status: item.navigation_state === 1 ? 'active' : 'inactive',
    statusLabel: stateOpt.label,
    stateValue: item.navigation_state,
    createdAt: item.navigation_created_at,
    updatedAt: item.navigation_updated_at ?? '',
  }
}

export const useNavigationListStore = create<State & Action>((set, get) => ({
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
    set({ filters: nextFilters, isFetching: true, isError: false, message: null })
    try {
      const response = await navigationsService.getList(nextFilters)
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
