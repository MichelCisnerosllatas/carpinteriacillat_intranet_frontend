import apiClient from '@/shared/api/apiClient'
import { TYPESECTIONS_ENDPOINTS } from './typesections.endpoint'
import type { TypeSectionListRequestDto, TypeSectionListResponseDto } from '../model/typesectionget.dto'
import type { TypeSectionPostRequestDto, TypeSectionPostResponseDto } from '../model/typesectionpost.dto'
import type { TypeSectionPutRequestDto, TypeSectionPutResponseDto } from '../model/typesectionput.dto'

export const typesectionsService = {
  getList: async (param: TypeSectionListRequestDto): Promise<TypeSectionListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    )
    const { data } = await apiClient.get<TypeSectionListResponseDto>(TYPESECTIONS_ENDPOINTS.v1.get, { params })
    return data
  },

  getForSelect: async (): Promise<TypeSectionListResponseDto> => {
    const { data } = await apiClient.get<TypeSectionListResponseDto>(TYPESECTIONS_ENDPOINTS.v1.get, {
      params: { page: 1, per_page: 500 },
    })
    return data
  },

  post: async (param: TypeSectionPostRequestDto): Promise<TypeSectionPostResponseDto> => {
    const { data } = await apiClient.post<TypeSectionPostResponseDto>(TYPESECTIONS_ENDPOINTS.v1.post, param)
    return data
  },

  put: async (id: number, param: TypeSectionPutRequestDto): Promise<TypeSectionPutResponseDto> => {
    const { data } = await apiClient.put<TypeSectionPutResponseDto>(TYPESECTIONS_ENDPOINTS.v1.put(id), param)
    return data
  },

  patch: async (id: number, param: Partial<TypeSectionPutRequestDto>): Promise<TypeSectionPutResponseDto> => {
    const { data } = await apiClient.patch<TypeSectionPutResponseDto>(TYPESECTIONS_ENDPOINTS.v1.patch(id), param)
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(TYPESECTIONS_ENDPOINTS.v1.delete(id))
    return data.success
  },
}
