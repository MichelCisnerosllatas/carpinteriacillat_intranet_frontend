import { create } from 'zustand'
import { companyBankAccountsService } from '../services/company-bank-accounts.service'
import { getStateOption } from '@/shared/config/entity-states'
import type { CompanyBankAccountListRequestDto, CompanyBankAccountApiItem } from '../model/companybankaccountget.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { CompanyBankAccount } from '../data/schema'

type State = {
  hasLoaded: boolean
  isInitialLoading: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  items: CompanyBankAccount[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: CompanyBankAccountListRequestDto
  currentItem: CompanyBankAccount | null
}

type Action = {
  load: (params?: CompanyBankAccountListRequestDto) => Promise<boolean>
  setCurrentItem: (item: CompanyBankAccount | null) => void
  reset: () => void
}

const defaultFilters: CompanyBankAccountListRequestDto = {
  page: 1, per_page: 10, search: '', status: undefined, currency: undefined,
}

const mapFromApi = (item: CompanyBankAccountApiItem): CompanyBankAccount => {
  const stateOpt = getStateOption(item.status)
  return {
    id: item.id,
    bank: item.bank,
    accountNumber: item.account_number,
    accountType: item.account_type,
    currency: item.currency,
    logo: item.logo,
    order: item.order ?? 1,
    status: item.status,
    statusLabel: stateOpt.label,
    createdAt: item.created_at,
    updatedAt: item.updated_at ?? '',
  }
}

export const useCompanyBankAccountListStore = create<State & Action>((set, get) => ({
  hasLoaded: false, isInitialLoading: false, isFetching: false,
  isError: false, message: null, items: [], links: null, meta: null,
  filters: defaultFilters, currentItem: null,

  setCurrentItem: (item) => set({ currentItem: item }),

  load: async (params = {}) => {
    const nextFilters = { ...get().filters, ...params }
    set({ filters: nextFilters, isFetching: true, isError: false, message: null })
    try {
      const response = await companyBankAccountsService.getList(nextFilters)
      if (!response.success) throw new Error(response.message)
      set({
        hasLoaded: true, isInitialLoading: false, isFetching: false, isError: false,
        message: response.message,
        items: response.data.map(mapFromApi),
        links: response.links, meta: response.meta,
        filters: {
          ...nextFilters,
          page: response.meta?.current_page ?? nextFilters.page,
          per_page: response.meta?.per_page ?? nextFilters.per_page,
        },
      })
      return true
    } catch (error: any) {
      set({
        hasLoaded: true, isInitialLoading: false, isFetching: false, isError: true,
        message: error?.response?.data?.message ?? error?.message ?? 'Error al cargar.',
      })
      return false
    }
  },

  reset: () => set({
    hasLoaded: false, isInitialLoading: false, isFetching: false, isError: false,
    message: null, items: [], links: null, meta: null, filters: defaultFilters,
  }),
}))
