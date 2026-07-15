import { create } from 'zustand'
import { companyBranchesService } from '../services/company-branches.service'
import { getStateOption } from '@/shared/config/entity-states'
import type { CompanyBranchListRequestDto, CompanyBranchApiItem } from '../model/companybranchget.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { CompanyBranch } from '../data/schema'

type State = {
  hasLoaded: boolean
  isInitialLoading: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  items: CompanyBranch[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: CompanyBranchListRequestDto
  currentItem: CompanyBranch | null
  /** false = load() reutiliza los datos ya cargados (hasLoaded) en vez de pedirlos de nuevo. Por defecto true: la pantalla vuelve a pedir la lista cada vez que se entra a la ruta. */
  forceReload: boolean
}

type Action = {
  setForceReload: (value: boolean) => void
  load: (params?: CompanyBranchListRequestDto) => Promise<boolean>
  setCurrentItem: (item: CompanyBranch | null) => void
  reset: () => void
}

const defaultFilters: CompanyBranchListRequestDto = {
  page: 1, per_page: 10, search: '', status: undefined,
}

const mapFromApi = (item: CompanyBranchApiItem): CompanyBranch => {
  const stateOpt = getStateOption(item.status)
  return {
    id: item.id,
    name: item.name,
    address: item.address,
    status: item.status === 1 ? 'active' : 'inactive',
    statusLabel: stateOpt.label,
    statusValue: item.status,
    createdAt: item.created_at,
    updatedAt: item.updated_at ?? '',
  }
}

export const useCompanyBranchListStore = create<State & Action>((set, get) => ({
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
      const response = await companyBranchesService.getList(nextFilters)
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
