import apiClient from '@/shared/api/apiClient'
import { TESTIMONY_WEB_SETTING_ENDPOINTS } from './testimonywebsetting.endpoint'
import type {
  TestimonyWebSettingGetResponseDto,
  TestimonyWebSettingUpdateRequestDto,
  TestimonyWebSettingUpdateResponseDto,
} from '../model/testimonywebsetting.dto'

export const testimonyWebSettingService = {
  // Singleton — sin parámetros. Si nunca se guardó nada, el backend responde con los defaults
  // de la tabla (show_photo/show_rating/show_city/show_delivered/show_verified: true,
  // show_email: false, testimony_limit: null) sin crear ninguna fila.
  get: async (): Promise<TestimonyWebSettingGetResponseDto> => {
    const { data } = await apiClient.get<TestimonyWebSettingGetResponseDto>(TESTIMONY_WEB_SETTING_ENDPOINTS.v1.get)
    return data
  },

  update: async (param: TestimonyWebSettingUpdateRequestDto): Promise<TestimonyWebSettingUpdateResponseDto> => {
    const { data } = await apiClient.patch<TestimonyWebSettingUpdateResponseDto>(TESTIMONY_WEB_SETTING_ENDPOINTS.v1.patch, param)
    return data
  },
}
