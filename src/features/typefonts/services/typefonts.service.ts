import apiClient from '@/shared/api/apiClient'
import { TYPEFONTS_ENDPOINTS } from './typefonts.endpoint'
import type { TypeFontListRequestDto, TypeFontListResponseDto } from '../model/typefontget.dto'
import type { TypeFontPostRequestDto, TypeFontPostResponseDto } from '../model/typefontpost.dto'
import type { TypeFontPutRequestDto, TypeFontPutResponseDto } from '../model/typefontput.dto'

export const typefontsService = {
  getList: async (param: TypeFontListRequestDto): Promise<TypeFontListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    )
    const { data } = await apiClient.get<TypeFontListResponseDto>(TYPEFONTS_ENDPOINTS.v1.get, { params })
    return data
  },

  getForSelect: async (): Promise<TypeFontListResponseDto> => {
    const { data } = await apiClient.get<TypeFontListResponseDto>(TYPEFONTS_ENDPOINTS.v1.get, {
      params: { page: 1, per_page: 100 },
    })
    return data
  },

  post: async (param: TypeFontPostRequestDto): Promise<TypeFontPostResponseDto> => {
    const { data } = await apiClient.post<TypeFontPostResponseDto>(TYPEFONTS_ENDPOINTS.v1.post, param)
    return data
  },

  put: async (id: number, param: TypeFontPutRequestDto): Promise<TypeFontPutResponseDto> => {
    const { data } = await apiClient.put<TypeFontPutResponseDto>(TYPEFONTS_ENDPOINTS.v1.put(id), param)
    return data
  },

  patch: async (id: number, param: Partial<TypeFontPutRequestDto>): Promise<TypeFontPutResponseDto> => {
    const { data } = await apiClient.patch<TypeFontPutResponseDto>(TYPEFONTS_ENDPOINTS.v1.patch(id), param)
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(TYPEFONTS_ENDPOINTS.v1.delete(id))
    return data.success
  },
}
