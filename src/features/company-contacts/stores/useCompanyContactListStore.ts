import { create } from 'zustand'
import { companyContactsService } from '../services/company-contacts.service'
import { getStateOption } from '@/shared/config/entity-states'
import type { CompanyContactListRequestDto, CompanyContactApiItem } from '../model/companycontactget.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { CompanyContact } from '../data/schema'

type State = {
  hasLoaded: boolean
  isInitialLoading: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  items: CompanyContact[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: CompanyContactListRequestDto
  currentItem: CompanyContact | null
}

type Action = {
  load: (params?: CompanyContactListRequestDto) => Promise<boolean>
  setCurrentItem: (item: CompanyContact | null) => void
  reset: () => void
}

const defaultFilters: CompanyContactListRequestDto = {
  page: 1, per_page: 10, search: '', status: undefined, type: undefined, show_on_website: undefined,
}

const mapFromApi = (item: CompanyContactApiItem): CompanyContact => {
  const stateOpt = getStateOption(item.status)
  return {
    id: item.id,
    name: item.name,
    phone: item.phone,
    type: item.type,
    email: item.email,
    isPrimary: item.is_primary,
    showOnWebsite: item.show_on_website,
    order: item.order,
    status: item.status === 1 ? 'active' : 'inactive',
    statusLabel: stateOpt.label,
    statusValue: item.status,
    createdAt: item.created_at,
    updatedAt: item.updated_at ?? '',
  }
}

export const useCompanyContactListStore = create<State & Action>((set, get) => ({
  hasLoaded: false, isInitialLoading: false, isFetching: false,
  isError: false, message: null, items: [], links: null, meta: null,
  filters: defaultFilters, currentItem: null,

  setCurrentItem: (item) => set({ currentItem: item }),

  load: async (params = {}) => {
    const nextFilters = { ...get().filters, ...params }
    set({ filters: nextFilters, isFetching: true, isError: false, message: null })
    try {
      const response = await companyContactsService.getList(nextFilters)
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
