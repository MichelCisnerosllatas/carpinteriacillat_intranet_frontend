import apiClient from '@/shared/api/apiClient'
import { TYPECOLORS_ENDPOINTS } from './typecolors.endpoint'
import type { TypeColorListRequestDto, TypeColorListResponseDto } from '../model/typecolorget.dto'
import type { TypeColorPostRequestDto, TypeColorPostResponseDto } from '../model/typecolorpost.dto'
import type { TypeColorPutRequestDto, TypeColorPutResponseDto } from '../model/typecolorput.dto'

export const typecolorsService = {
  getList: async (param: TypeColorListRequestDto): Promise<TypeColorListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    )
    const { data } = await apiClient.get<TypeColorListResponseDto>(TYPECOLORS_ENDPOINTS.v1.get, { params })
    return data
  },

  getForSelect: async (): Promise<TypeColorListResponseDto> => {
    const { data } = await apiClient.get<TypeColorListResponseDto>(TYPECOLORS_ENDPOINTS.v1.get, {
      params: { page: 1, per_page: 500 },
    })
    return data
  },

  post: async (param: TypeColorPostRequestDto): Promise<TypeColorPostResponseDto> => {
    const { data } = await apiClient.post<TypeColorPostResponseDto>(TYPECOLORS_ENDPOINTS.v1.post, param)
    return data
  },

  put: async (id: number, param: TypeColorPutRequestDto): Promise<TypeColorPutResponseDto> => {
    const { data } = await apiClient.put<TypeColorPutResponseDto>(TYPECOLORS_ENDPOINTS.v1.put(id), param)
    return data
  },

  patch: async (id: number, param: Partial<TypeColorPutRequestDto>): Promise<TypeColorPutResponseDto> => {
    const { data } = await apiClient.patch<TypeColorPutResponseDto>(TYPECOLORS_ENDPOINTS.v1.patch(id), param)
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(TYPECOLORS_ENDPOINTS.v1.delete(id))
    return data.success
  },
}
