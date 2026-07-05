import apiClient from '@/shared/api/apiClient'
import { COMPANY_SETTINGS_ENDPOINTS } from './company-settings.endpoint'
import type { CompanySettingGetResponseDto } from '../model/companysettingget.dto'
import type {
  CompanySettingPutRequestDto,
  CompanySettingPatchRequestDto,
  CompanySettingPutResponseDto,
} from '../model/companysettingput.dto'

export const companySettingsService = {
  get: async (): Promise<CompanySettingGetResponseDto> => {
    const { data } = await apiClient.get<CompanySettingGetResponseDto>(COMPANY_SETTINGS_ENDPOINTS.v1.get)
    return data
  },

  put: async (param: CompanySettingPutRequestDto): Promise<CompanySettingPutResponseDto> => {
    const { data } = await apiClient.put<CompanySettingPutResponseDto>(COMPANY_SETTINGS_ENDPOINTS.v1.put, param)
    return data
  },

  patch: async (param: CompanySettingPatchRequestDto): Promise<CompanySettingPutResponseDto> => {
    const { data } = await apiClient.patch<CompanySettingPutResponseDto>(COMPANY_SETTINGS_ENDPOINTS.v1.patch, param)
    return data
  },
}
