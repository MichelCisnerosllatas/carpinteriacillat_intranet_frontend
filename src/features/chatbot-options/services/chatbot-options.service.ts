import apiClient from '@/shared/api/apiClient'
import { CHATBOT_OPTIONS_ENDPOINTS } from './chatbot-options.endpoint'
import type { ChatbotOptionListRequestDto, ChatbotOptionListResponseDto, ChatbotOptionGetByIdResponseDto } from '../model/chatbotoptionget.dto'
import type { ChatbotOptionPostRequestDto, ChatbotOptionPostResponseDto } from '../model/chatbotoptionpost.dto'
import type {
  ChatbotOptionPutRequestDto, ChatbotOptionPutResponseDto,
  ChatbotOptionReorderRequestDto, ChatbotOptionReorderResponseDto,
} from '../model/chatbotoptionput.dto'

export const chatbotOptionsService = {
  getList: async (param: ChatbotOptionListRequestDto): Promise<ChatbotOptionListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([, v]) => v !== undefined && v !== null && v !== '')
    )
    const { data } = await apiClient.get<ChatbotOptionListResponseDto>(CHATBOT_OPTIONS_ENDPOINTS.v1.get, { params })
    return data
  },

  getById: async (id: number): Promise<ChatbotOptionGetByIdResponseDto> => {
    const { data } = await apiClient.get<ChatbotOptionGetByIdResponseDto>(CHATBOT_OPTIONS_ENDPOINTS.v1.getById(id))
    return data
  },

  post: async (param: ChatbotOptionPostRequestDto): Promise<ChatbotOptionPostResponseDto> => {
    const { data } = await apiClient.post<ChatbotOptionPostResponseDto>(CHATBOT_OPTIONS_ENDPOINTS.v1.post, param)
    return data
  },

  put: async (id: number, param: ChatbotOptionPutRequestDto): Promise<ChatbotOptionPutResponseDto> => {
    const { data } = await apiClient.put<ChatbotOptionPutResponseDto>(CHATBOT_OPTIONS_ENDPOINTS.v1.put(id), param)
    return data
  },

  /** Cambia solo algunos campos (lo usa el interruptor "Activa" de la lista). */
  patch: async (id: number, param: Partial<ChatbotOptionPutRequestDto>): Promise<ChatbotOptionPutResponseDto> => {
    const { data } = await apiClient.patch<ChatbotOptionPutResponseDto>(CHATBOT_OPTIONS_ENDPOINTS.v1.patch(id), param)
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(CHATBOT_OPTIONS_ENDPOINTS.v1.delete(id))
    return data.success
  },

  reorder: async (param: ChatbotOptionReorderRequestDto): Promise<ChatbotOptionReorderResponseDto> => {
    const { data } = await apiClient.post<ChatbotOptionReorderResponseDto>(CHATBOT_OPTIONS_ENDPOINTS.v1.reorder, param)
    return data
  },
}
