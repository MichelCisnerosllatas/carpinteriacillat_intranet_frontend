import apiClient from '@/shared/api/apiClient'
import { COMPANY_BRANCHES_ENDPOINTS } from './company-branches.endpoint'
import type { CompanyBranchListRequestDto, CompanyBranchListResponseDto } from '../model/companybranchget.dto'
import type { CompanyBranchPostRequestDto, CompanyBranchPostResponseDto } from '../model/companybranchpost.dto'
import type { CompanyBranchPutRequestDto, CompanyBranchPutResponseDto } from '../model/companybranchput.dto'

export const companyBranchesService = {
  getList: async (param: CompanyBranchListRequestDto): Promise<CompanyBranchListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    )
    const { data } = await apiClient.get<CompanyBranchListResponseDto>(COMPANY_BRANCHES_ENDPOINTS.v1.get, { params })
    return data
  },

  post: async (param: CompanyBranchPostRequestDto): Promise<CompanyBranchPostResponseDto> => {
    const { data } = await apiClient.post<CompanyBranchPostResponseDto>(COMPANY_BRANCHES_ENDPOINTS.v1.post, param)
    return data
  },

  put: async (id: number, param: CompanyBranchPutRequestDto): Promise<CompanyBranchPutResponseDto> => {
    const { data } = await apiClient.put<CompanyBranchPutResponseDto>(COMPANY_BRANCHES_ENDPOINTS.v1.put(id), param)
    return data
  },

  patch: async (id: number, param: Partial<CompanyBranchPutRequestDto>): Promise<CompanyBranchPutResponseDto> => {
    const { data } = await apiClient.patch<CompanyBranchPutResponseDto>(COMPANY_BRANCHES_ENDPOINTS.v1.patch(id), param)
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(COMPANY_BRANCHES_ENDPOINTS.v1.delete(id))
    return data.success
  },
}
