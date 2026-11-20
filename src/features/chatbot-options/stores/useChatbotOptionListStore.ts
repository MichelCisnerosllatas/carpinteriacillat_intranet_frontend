import { create } from 'zustand'
import { chatbotOptionsService } from '../services/chatbot-options.service'
import type { ChatbotOptionListRequestDto, ChatbotOptionApiItem } from '../model/chatbotoptionget.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { ChatbotOption } from '../data/schema'

type State = {
  hasLoaded: boolean
  isInitialLoading: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  items: ChatbotOption[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: ChatbotOptionListRequestDto
  forceReload: boolean
}

type Action = {
  setForceReload: (value: boolean) => void
  load: (params?: ChatbotOptionListRequestDto) => Promise<boolean>
  reset: () => void
}

const defaultFilters: ChatbotOptionListRequestDto = { page: 1, per_page: 20, search: '', state: undefined }

export const mapChatbotOptionFromApi = (item: ChatbotOptionApiItem): ChatbotOption => ({
  id: item.id_chatbot_option,
  key: item.option_key,
  title: item.title,
  subtitle: item.subtitle,
  icon: item.icon,
  action: item.action,
  value: item.value,
  order: item.sort_order ?? 0,
  // Boolean(...) por si el backend manda 1/0
  state: Boolean(item.state),
})

export const useChatbotOptionListStore = create<State & Action>((set, get) => ({
  hasLoaded: false, isInitialLoading: false, isFetching: false,
  isError: false, message: null, items: [], links: null, meta: null,
  filters: defaultFilters,
  forceReload: true,

  setForceReload: (value) => set({ forceReload: value }),

  load: async (params = {}) => {
    if (get().isFetching) return false
    if (!get().forceReload && get().hasLoaded) return true
    const nextFilters = { ...get().filters, ...params }
    set({ filters: nextFilters, isFetching: true })
    try {
      const response = await chatbotOptionsService.getList(nextFilters)
      if (!response.success) throw new Error(response.message)
      set({
        hasLoaded: true, isInitialLoading: false, isFetching: false, isError: false,
        message: response.message,
        items: response.data.map(mapChatbotOptionFromApi),
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
