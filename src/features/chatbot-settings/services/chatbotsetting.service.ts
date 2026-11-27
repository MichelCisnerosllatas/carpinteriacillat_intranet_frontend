import apiClient from '@/shared/api/apiClient'
import { CHATBOT_SETTING_ENDPOINTS } from './chatbotsetting.endpoint'
import type {
  ChatbotSettingGetResponseDto,
  ChatbotSettingUpdateRequestDto,
  ChatbotSettingUpdateResponseDto,
} from '../model/chatbotsetting.dto'

export const chatbotSettingService = {
  // Singleton — sin parámetros. Si nunca se guardó nada, el backend responde con los defaults.
  get: async (): Promise<ChatbotSettingGetResponseDto> => {
    const { data } = await apiClient.get<ChatbotSettingGetResponseDto>(CHATBOT_SETTING_ENDPOINTS.v1.get)
    return data
  },

  update: async (param: ChatbotSettingUpdateRequestDto): Promise<ChatbotSettingUpdateResponseDto> => {
    const { data } = await apiClient.patch<ChatbotSettingUpdateResponseDto>(CHATBOT_SETTING_ENDPOINTS.v1.patch, param)
    return data
  },
}
