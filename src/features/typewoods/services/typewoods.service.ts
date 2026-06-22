import apiClient from '@/shared/api/apiClient'
import { TYPEWOODS_ENDPOINTS } from './typewoods.endpoint'
import type { TypeWoodListRequestDto, TypeWoodListResponseDto } from '../model/typewoodget.dto'
import type { TypeWoodPostRequestDto, TypeWoodPostResponseDto } from '../model/typewoodpost.dto'
import type { TypeWoodPutRequestDto, TypeWoodPutResponseDto } from '../model/typewoodput.dto'

export const typewoodsService = {
  getList: async (param: TypeWoodListRequestDto): Promise<TypeWoodListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    )
    const { data } = await apiClient.get<TypeWoodListResponseDto>(TYPEWOODS_ENDPOINTS.v1.get, { params })
    return data
  },

  getForSelect: async (): Promise<TypeWoodListResponseDto> => {
    const { data } = await apiClient.get<TypeWoodListResponseDto>(TYPEWOODS_ENDPOINTS.v1.get, {
      params: { page: 1, per_page: 100 },
    })
    return data
  },

  post: async (param: TypeWoodPostRequestDto): Promise<TypeWoodPostResponseDto> => {
    const { data } = await apiClient.post<TypeWoodPostResponseDto>(TYPEWOODS_ENDPOINTS.v1.post, param)
    return data
  },

  put: async (id: number, param: TypeWoodPutRequestDto): Promise<TypeWoodPutResponseDto> => {
    const { data } = await apiClient.put<TypeWoodPutResponseDto>(TYPEWOODS_ENDPOINTS.v1.put(id), param)
    return data
  },

  patch: async (id: number, param: Partial<TypeWoodPutRequestDto>): Promise<TypeWoodPutResponseDto> => {
    const { data } = await apiClient.patch<TypeWoodPutResponseDto>(TYPEWOODS_ENDPOINTS.v1.patch(id), param)
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(TYPEWOODS_ENDPOINTS.v1.delete(id))
    return data.success
  },
}
