import apiClient from '@/shared/api/apiClient'
import { FOOTER_SETTING_ENDPOINTS } from './footersetting.endpoint'
import type {
  FooterSettingGetResponseDto,
  FooterSettingUpdateRequestDto,
  FooterSettingUpdateResponseDto,
} from '../model/footersetting.dto'

export const footerSettingService = {
  // Singleton — sin parámetros. Si nunca se guardó nada, el backend responde con los defaults
  // de la tabla (todo en `true`) sin crear ninguna fila.
  get: async (): Promise<FooterSettingGetResponseDto> => {
    const { data } = await apiClient.get<FooterSettingGetResponseDto>(FOOTER_SETTING_ENDPOINTS.v1.get)
    return data
  },

  update: async (param: FooterSettingUpdateRequestDto): Promise<FooterSettingUpdateResponseDto> => {
    const { data } = await apiClient.patch<FooterSettingUpdateResponseDto>(FOOTER_SETTING_ENDPOINTS.v1.patch, param)
    return data
  },
}
