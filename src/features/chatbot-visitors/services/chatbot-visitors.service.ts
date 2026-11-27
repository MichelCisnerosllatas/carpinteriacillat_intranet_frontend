import apiClient from '@/shared/api/apiClient'
import { CHATBOT_VISITORS_ENDPOINTS } from './chatbot-visitors.endpoint'
import type {
  ChatbotVisitorListRequestDto, ChatbotVisitorListResponseDto, ChatbotVisitorGetByIdResponseDto,
} from '../model/chatbotvisitorget.dto'

export const chatbotVisitorsService = {
  getList: async (param: ChatbotVisitorListRequestDto): Promise<ChatbotVisitorListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([, v]) => v !== undefined && v !== null && v !== '')
    )
    const { data } = await apiClient.get<ChatbotVisitorListResponseDto>(CHATBOT_VISITORS_ENDPOINTS.v1.get, { params })
    return data
  },

  getById: async (id: number): Promise<ChatbotVisitorGetByIdResponseDto> => {
    const { data } = await apiClient.get<ChatbotVisitorGetByIdResponseDto>(CHATBOT_VISITORS_ENDPOINTS.v1.getById(id))
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(CHATBOT_VISITORS_ENDPOINTS.v1.delete(id))
    return data.success
  },
}
