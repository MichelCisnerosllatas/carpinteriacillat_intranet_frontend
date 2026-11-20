import { create } from 'zustand'
import { chatbotVisitorsService } from '../services/chatbot-visitors.service'
import type { ChatbotVisitorApiItem, ChatbotVisitorDetailApiItem, ChatbotVisitorListRequestDto } from '../model/chatbotvisitorget.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { ChatbotVisitor, ChatbotVisitorDetail } from '../data/schema'

type State = {
  hasLoaded: boolean
  isInitialLoading: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  items: ChatbotVisitor[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: ChatbotVisitorListRequestDto
}

type Action = {
  load: (params?: ChatbotVisitorListRequestDto) => Promise<boolean>
  reset: () => void
}

const defaultFilters: ChatbotVisitorListRequestDto = { page: 1, per_page: 20, search: '' }

export const mapChatbotVisitorFromApi = (item: ChatbotVisitorApiItem): ChatbotVisitor => ({
  id: item.id_chatbot_visitor,
  token: item.visitor_token,
  userId: item.id_user,
  name: item.name,
  phone: item.phone,
  email: item.email,
  ipAddress: item.ip_address,
  userAgent: item.user_agent,
  lastSeenAt: item.last_seen_at,
  createdAt: item.created_at,
  conversationsCount: item.conversations_count ?? 0,
})

export const mapChatbotVisitorDetailFromApi = (item: ChatbotVisitorDetailApiItem): ChatbotVisitorDetail => ({
  ...mapChatbotVisitorFromApi(item),
  conversations: (item.conversations ?? []).map((c) => ({
    id: c.id_chatbot_conversation,
    status: c.status,
    messagesCount: c.messages_count ?? 0,
    lastMessageAt: c.last_message_at,
    createdAt: c.created_at,
    optionTitle: c.option_title,
  })),
})

export const useChatbotVisitorListStore = create<State & Action>((set, get) => ({
  hasLoaded: false, isInitialLoading: false, isFetching: false,
  isError: false, message: null, items: [], links: null, meta: null,
  filters: defaultFilters,

  load: async (params = {}) => {
    if (get().isFetching) return false
    const nextFilters = { ...get().filters, ...params }
    set({ filters: nextFilters, isFetching: true })
    try {
      const response = await chatbotVisitorsService.getList(nextFilters)
      if (!response.success) throw new Error(response.message)
      set({
        hasLoaded: true, isInitialLoading: false, isFetching: false, isError: false,
        message: response.message,
        items: response.data.map(mapChatbotVisitorFromApi),
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
