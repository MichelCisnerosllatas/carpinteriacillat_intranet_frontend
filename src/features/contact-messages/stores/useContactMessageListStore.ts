import { create } from 'zustand'
import { contactMessagesService } from '../services/contact-messages.service'
import type { ContactMessageListRequestDto, ContactMessageApiItem } from '../model/contactmessageget.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { ContactMessage } from '../data/schema'

type State = {
  hasLoaded: boolean
  isInitialLoading: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  items: ContactMessage[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: ContactMessageListRequestDto
  currentItem: ContactMessage | null
  /** false = load() reutiliza los datos ya cargados (hasLoaded) en vez de pedirlos de nuevo. Por defecto true: la pantalla vuelve a pedir la lista cada vez que se entra a la ruta. */
  forceReload: boolean
}

type Action = {
  setForceReload: (value: boolean) => void
  load: (params?: ContactMessageListRequestDto) => Promise<boolean>
  loadById: (id: number) => Promise<boolean>
  setCurrentItem: (item: ContactMessage | null) => void
  reset: () => void
}

const defaultFilters: ContactMessageListRequestDto = {
  page: 1, per_page: 10, search: '', status: undefined, project_type: undefined, date_from: undefined, date_to: undefined,
}

export const mapContactMessageFromApi = (item: ContactMessageApiItem): ContactMessage => ({
  id: item.id,
  name: item.name,
  email: item.email,
  phone: item.phone,
  projectType: item.project_type as ContactMessage['projectType'],
  message: item.message,
  status: item.status,
  ipAddress: item.ip_address,
  createdAt: item.created_at,
  createdAtFormatted: item.created_at_formatted,
  updatedAt: item.updated_at,
  updatedAtFormatted: item.updated_at_formatted,
})

export const useContactMessageListStore = create<State & Action>((set, get) => ({
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
      const response = await contactMessagesService.getList(nextFilters)
      if (!response.success) throw new Error(response.message)
      set({
        hasLoaded: true, isInitialLoading: false, isFetching: false, isError: false,
        message: response.message,
        items: response.data.map(mapContactMessageFromApi),
        links: response.links, meta: response.meta,
        filters: { ...nextFilters, page: response.meta?.current_page ?? nextFilters.page, per_page: response.meta?.per_page ?? nextFilters.per_page },
      })
      return true
    } catch (error: any) {
      set({ hasLoaded: true, isInitialLoading: false, isFetching: false, isError: true, message: error?.response?.data?.message ?? error?.message ?? 'Error al cargar.' })
      return false
    }
  },

  loadById: async (id) => {
    try {
      const response = await contactMessagesService.getById(id)
      if (!response.success) throw new Error(response.message)
      set({ currentItem: mapContactMessageFromApi(response.data) })
      return true
    } catch {
      return false
    }
  },

  reset: () => set({ hasLoaded: false, isInitialLoading: false, isFetching: false, isError: false, message: null, items: [], links: null, meta: null, filters: defaultFilters }),
}))
