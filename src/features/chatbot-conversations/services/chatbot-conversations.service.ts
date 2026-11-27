import apiClient from '@/shared/api/apiClient'
import { CHATBOT_CONVERSATIONS_ENDPOINTS } from './chatbot-conversations.endpoint'
import type {
  ChatbotConversationListRequestDto, ChatbotConversationListResponseDto,
  ChatbotConversationGetByIdResponseDto,
  ChatbotConversationStatusRequestDto, ChatbotConversationStatusResponseDto,
} from '../model/chatbotconversationget.dto'

export const chatbotConversationsService = {
  getList: async (param: ChatbotConversationListRequestDto): Promise<ChatbotConversationListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([, v]) => v !== undefined && v !== null && v !== '')
    )
    const { data } = await apiClient.get<ChatbotConversationListResponseDto>(CHATBOT_CONVERSATIONS_ENDPOINTS.v1.get, { params })
    return data
  },

  getById: async (id: number): Promise<ChatbotConversationGetByIdResponseDto> => {
    const { data } = await apiClient.get<ChatbotConversationGetByIdResponseDto>(CHATBOT_CONVERSATIONS_ENDPOINTS.v1.getById(id))
    return data
  },

  patchStatus: async (id: number, param: ChatbotConversationStatusRequestDto): Promise<ChatbotConversationStatusResponseDto> => {
    const { data } = await apiClient.patch<ChatbotConversationStatusResponseDto>(CHATBOT_CONVERSATIONS_ENDPOINTS.v1.status(id), param)
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(CHATBOT_CONVERSATIONS_ENDPOINTS.v1.delete(id))
    return data.success
  },
}
