// src/features/clients/stores/useClientListStore.ts
import { create } from 'zustand'
import { clientsService } from '../services/clients.service'
import { getStateOption } from '@/shared/config/entity-states'
import type { ClientListRequestDto } from '../model/clientget.dto'
import type { ClientJoinApiItem } from '../model/client-api-item.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { Client } from '../data/schema'

type State = {
  hasLoaded: boolean
  isInitialLoading: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  items: Client[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: ClientListRequestDto
  currentItem: Client | null
}

type Action = {
  load: (params?: ClientListRequestDto) => Promise<boolean>
  loadById: (id: number) => Promise<boolean>
  setCurrentItem: (item: Client | null) => void
  reset: () => void
}

const defaultFilters: ClientListRequestDto = { page: 1, per_page: 10, search: '', id_typedoc: undefined, status: undefined }

const mapFromApi = (item: ClientJoinApiItem): Client => {
  const stateOpt = getStateOption(item.status)
  return {
    id: item.id,
    idTypedoc: item.id_typedoc,
    typedocName: item.type_doc?.typedoc_name ?? null,
    businessName: item.business_name,
    documentNumber: item.document_number,
    address: item.address,
    contactPerson: item.contact_person,
    phone: item.phone,
    email: item.email,
    status: item.status === 1 ? 'active' : 'inactive',
    statusLabel: stateOpt.label,
    stateValue: item.status,
    createdAt: item.created_at,
    updatedAt: item.updated_at ?? '',
  }
}

export const useClientListStore = create<State & Action>((set, get) => ({
  hasLoaded: false, isInitialLoading: false, isFetching: false,
  isError: false, message: null, items: [], links: null, meta: null,
  filters: defaultFilters, currentItem: null,

  setCurrentItem: (item) => set({ currentItem: item }),

  loadById: async (id) => {
    set({ isFetching: true, isError: false, message: null })
    try {
      const response = await clientsService.getById(id)
      if (!response.success) throw new Error(response.message)
      const mapped = mapFromApi(response.data)
      set({ isFetching: false, currentItem: mapped, hasLoaded: true })
      return true
    } catch (error: any) {
      set({ isFetching: false, isError: true, message: error?.response?.data?.message ?? error?.message ?? 'Error al cargar.' })
      return false
    }
  },

  load: async (params = {}) => {
    if (get().isFetching) return false
    const nextFilters = { ...get().filters, ...params }
    set({ filters: nextFilters, isFetching: true, isError: false, message: null })
    try {
      const response = await clientsService.getList(nextFilters)
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
