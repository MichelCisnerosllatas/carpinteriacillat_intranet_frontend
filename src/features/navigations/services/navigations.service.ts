import apiClient from '@/shared/api/apiClient'
import { NAVIGATIONS_ENDPOINTS } from './navigations.endpoint'
import type { NavigationListRequestDto, NavigationListResponseDto } from '../model/navigationget.dto'
import type { NavigationPostRequestDto, NavigationPostResponseDto } from '../model/navigationpost.dto'
import type { NavigationPutRequestDto, NavigationPutResponseDto } from '../model/navigationput.dto'

export const navigationsService = {
  getList: async (param: NavigationListRequestDto): Promise<NavigationListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    )
    const { data } = await apiClient.get<NavigationListResponseDto>(NAVIGATIONS_ENDPOINTS.v1.get, { params })
    return data
  },

  getForSelect: async (): Promise<NavigationListResponseDto> => {
    const { data } = await apiClient.get<NavigationListResponseDto>(NAVIGATIONS_ENDPOINTS.v1.get, {
      params: { page: 1, per_page: 100 },
    })
    return data
  },

  /** Igual que getForSelect, pero es la que consume useNavigationModalSelectStore para <ModalSelect />. */
  getForModalSelect: async (): Promise<NavigationListResponseDto> => {
    const { data } = await apiClient.get<NavigationListResponseDto>(NAVIGATIONS_ENDPOINTS.v1.get, {
      params: { page: 1, per_page: 100 },
    })
    return data
  },

  post: async (param: NavigationPostRequestDto): Promise<NavigationPostResponseDto> => {
    const { data } = await apiClient.post<NavigationPostResponseDto>(NAVIGATIONS_ENDPOINTS.v1.post, param)
    return data
  },

  put: async (id: number, param: NavigationPutRequestDto): Promise<NavigationPutResponseDto> => {
    const { data } = await apiClient.put<NavigationPutResponseDto>(NAVIGATIONS_ENDPOINTS.v1.put(id), param)
    return data
  },

  patch: async (id: number, param: Partial<NavigationPutRequestDto>): Promise<NavigationPutResponseDto> => {
    const { data } = await apiClient.patch<NavigationPutResponseDto>(NAVIGATIONS_ENDPOINTS.v1.patch(id), param)
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(NAVIGATIONS_ENDPOINTS.v1.delete(id))
    return data.success
  },
}
