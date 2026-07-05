import apiClient from '@/shared/api/apiClient'
import { COMPANY_SIGNATURES_ENDPOINTS } from './company-signatures.endpoint'
import type { CompanySignatureListRequestDto, CompanySignatureListResponseDto } from '../model/companysignatureget.dto'
import type { CompanySignaturePostRequestDto, CompanySignaturePostResponseDto } from '../model/companysignaturepost.dto'
import type { CompanySignaturePutRequestDto, CompanySignaturePutResponseDto } from '../model/companysignatureput.dto'

export const companySignaturesService = {
  getList: async (param: CompanySignatureListRequestDto): Promise<CompanySignatureListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    )
    const { data } = await apiClient.get<CompanySignatureListResponseDto>(COMPANY_SIGNATURES_ENDPOINTS.v1.get, { params })
    return data
  },

  post: async (param: CompanySignaturePostRequestDto): Promise<CompanySignaturePostResponseDto> => {
    const { data } = await apiClient.post<CompanySignaturePostResponseDto>(COMPANY_SIGNATURES_ENDPOINTS.v1.post, param)
    return data
  },

  put: async (id: number, param: CompanySignaturePutRequestDto): Promise<CompanySignaturePutResponseDto> => {
    const { data } = await apiClient.put<CompanySignaturePutResponseDto>(COMPANY_SIGNATURES_ENDPOINTS.v1.put(id), param)
    return data
  },

  patch: async (id: number, param: Partial<CompanySignaturePutRequestDto>): Promise<CompanySignaturePutResponseDto> => {
    const { data } = await apiClient.patch<CompanySignaturePutResponseDto>(COMPANY_SIGNATURES_ENDPOINTS.v1.patch(id), param)
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(COMPANY_SIGNATURES_ENDPOINTS.v1.delete(id))
    return data.success
  },
}
