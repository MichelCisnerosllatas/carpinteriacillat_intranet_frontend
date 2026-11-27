import { create } from 'zustand'
import { chatbotConversationsService } from '../services/chatbot-conversations.service'
import type {
  ChatbotConversationApiItem, ChatbotConversationDetailApiItem, ChatbotConversationListRequestDto, ChatbotMessageApiItem,
} from '../model/chatbotconversationget.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { ChatbotConversation, ChatbotConversationDetail, ChatbotMessage } from '../data/schema'

type State = {
  hasLoaded: boolean
  isInitialLoading: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  items: ChatbotConversation[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: ChatbotConversationListRequestDto
}

type Action = {
  load: (params?: ChatbotConversationListRequestDto) => Promise<boolean>
  reset: () => void
}

const defaultFilters: ChatbotConversationListRequestDto = {
  page: 1, per_page: 20, search: '', status: undefined, id_chatbot_option: undefined, id_chatbot_visitor: undefined,
}

export const mapChatbotConversationFromApi = (item: ChatbotConversationApiItem): ChatbotConversation => ({
  id: item.id_chatbot_conversation,
  uuid: item.uuid,
  status: item.status,
  pageUrl: item.page_url,
  messagesCount: item.messages_count ?? 0,
  lastMessageAt: item.last_message_at,
  createdAt: item.created_at,
  visitor: {
    id: item.visitor?.id_chatbot_visitor ?? 0,
    name: item.visitor?.name ?? null,
    phone: item.visitor?.phone ?? null,
    email: item.visitor?.email ?? null,
  },
  option: item.option ? { id: item.option.id_chatbot_option, title: item.option.title } : null,
  lastMessage: item.last_message,
})

export const mapChatbotMessageFromApi = (m: ChatbotMessageApiItem): ChatbotMessage => ({
  id: m.id_chatbot_message,
  role: m.role,
  content: m.content,
  inputType: m.input_type === 'voice' ? 'voice' : 'text',
  createdAt: m.created_at,
})

export const mapChatbotConversationDetailFromApi = (item: ChatbotConversationDetailApiItem): ChatbotConversationDetail => ({
  ...mapChatbotConversationFromApi(item),
  messages: (item.messages ?? []).map(mapChatbotMessageFromApi),
})

export const useChatbotConversationListStore = create<State & Action>((set, get) => ({
  hasLoaded: false, isInitialLoading: false, isFetching: false,
  isError: false, message: null, items: [], links: null, meta: null,
  filters: defaultFilters,

  load: async (params = {}) => {
    if (get().isFetching) return false
    const nextFilters = { ...get().filters, ...params }
    set({ filters: nextFilters, isFetching: true })
    try {
      const response = await chatbotConversationsService.getList(nextFilters)
      if (!response.success) throw new Error(response.message)
      set({
        hasLoaded: true, isInitialLoading: false, isFetching: false, isError: false,
        message: response.message,
        items: response.data.map(mapChatbotConversationFromApi),
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
