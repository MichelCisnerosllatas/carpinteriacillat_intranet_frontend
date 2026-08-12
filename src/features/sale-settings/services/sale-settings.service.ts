import apiClient from '@/shared/api/apiClient'
import { SALE_SETTINGS_ENDPOINTS } from './sale-settings.endpoint'
import type { SaleSettingGetResponseDto } from '../model/salesettingget.dto'
import type {
  SaleSettingPutRequestDto,
  SaleSettingPatchRequestDto,
  SaleSettingPutResponseDto,
} from '../model/salesettingput.dto'

export const saleSettingsService = {
  get: async (): Promise<SaleSettingGetResponseDto> => {
    const { data } = await apiClient.get<SaleSettingGetResponseDto>(SALE_SETTINGS_ENDPOINTS.v1.get)
    return data
  },

  put: async (param: SaleSettingPutRequestDto): Promise<SaleSettingPutResponseDto> => {
    const { data } = await apiClient.put<SaleSettingPutResponseDto>(SALE_SETTINGS_ENDPOINTS.v1.put, param)
    return data
  },

  patch: async (param: SaleSettingPatchRequestDto): Promise<SaleSettingPutResponseDto> => {
    const { data } = await apiClient.patch<SaleSettingPutResponseDto>(SALE_SETTINGS_ENDPOINTS.v1.patch, param)
    return data
  },
}
