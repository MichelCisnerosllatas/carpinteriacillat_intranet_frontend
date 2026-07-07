import apiClient from '@/shared/api/apiClient'
import { COMPANY_SOCIAL_NETWORKS_ENDPOINTS } from './company-social-networks.endpoint'
import type { CompanySocialNetworkListRequestDto, CompanySocialNetworkListResponseDto } from '../model/companysocialnetworkget.dto'
import type { CompanySocialNetworkPostRequestDto, CompanySocialNetworkPostResponseDto } from '../model/companysocialnetworkpost.dto'
import type { CompanySocialNetworkPutRequestDto, CompanySocialNetworkPutResponseDto } from '../model/companysocialnetworkput.dto'

export const companySocialNetworksService = {
  getList: async (param: CompanySocialNetworkListRequestDto): Promise<CompanySocialNetworkListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    )
    const { data } = await apiClient.get<CompanySocialNetworkListResponseDto>(COMPANY_SOCIAL_NETWORKS_ENDPOINTS.v1.get, { params })
    return data
  },

  post: async (param: CompanySocialNetworkPostRequestDto): Promise<CompanySocialNetworkPostResponseDto> => {
    const { data } = await apiClient.post<CompanySocialNetworkPostResponseDto>(COMPANY_SOCIAL_NETWORKS_ENDPOINTS.v1.post, param)
    return data
  },

  put: async (id: number, param: CompanySocialNetworkPutRequestDto): Promise<CompanySocialNetworkPutResponseDto> => {
    const { data } = await apiClient.put<CompanySocialNetworkPutResponseDto>(COMPANY_SOCIAL_NETWORKS_ENDPOINTS.v1.put(id), param)
    return data
  },

  patch: async (id: number, param: Partial<CompanySocialNetworkPutRequestDto>): Promise<CompanySocialNetworkPutResponseDto> => {
    const { data } = await apiClient.patch<CompanySocialNetworkPutResponseDto>(COMPANY_SOCIAL_NETWORKS_ENDPOINTS.v1.patch(id), param)
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(COMPANY_SOCIAL_NETWORKS_ENDPOINTS.v1.delete(id))
    return data.success
  },
}
