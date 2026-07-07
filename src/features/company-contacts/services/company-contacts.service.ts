import apiClient from '@/shared/api/apiClient'
import { COMPANY_CONTACTS_ENDPOINTS } from './company-contacts.endpoint'
import type { CompanyContactListRequestDto, CompanyContactListResponseDto } from '../model/companycontactget.dto'
import type { CompanyContactPostRequestDto, CompanyContactPostResponseDto } from '../model/companycontactpost.dto'
import type { CompanyContactPutRequestDto, CompanyContactPutResponseDto } from '../model/companycontactput.dto'

export const companyContactsService = {
  getList: async (param: CompanyContactListRequestDto): Promise<CompanyContactListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    )
    const { data } = await apiClient.get<CompanyContactListResponseDto>(COMPANY_CONTACTS_ENDPOINTS.v1.get, { params })
    return data
  },

  post: async (param: CompanyContactPostRequestDto): Promise<CompanyContactPostResponseDto> => {
    const { data } = await apiClient.post<CompanyContactPostResponseDto>(COMPANY_CONTACTS_ENDPOINTS.v1.post, param)
    return data
  },

  put: async (id: number, param: CompanyContactPutRequestDto): Promise<CompanyContactPutResponseDto> => {
    const { data } = await apiClient.put<CompanyContactPutResponseDto>(COMPANY_CONTACTS_ENDPOINTS.v1.put(id), param)
    return data
  },

  patch: async (id: number, param: Partial<CompanyContactPutRequestDto>): Promise<CompanyContactPutResponseDto> => {
    const { data } = await apiClient.patch<CompanyContactPutResponseDto>(COMPANY_CONTACTS_ENDPOINTS.v1.patch(id), param)
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(COMPANY_CONTACTS_ENDPOINTS.v1.delete(id))
    return data.success
  },
}
