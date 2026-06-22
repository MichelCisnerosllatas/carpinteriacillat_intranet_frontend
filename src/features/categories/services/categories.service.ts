import apiClient from '@/shared/api/apiClient'
import { CATEGORIES_ENDPOINTS } from './categories.endpoint'
import type { CategoryListRequestDto, CategoryListResponseDto } from '../model/categoryget.dto'
import type { CategoryPostRequestDto, CategoryPostResponseDto } from '../model/categorypost.dto'
import type { CategoryPutRequestDto, CategoryPutResponseDto } from '../model/categoryput.dto'

export const categoriesService = {
  getList: async (param: CategoryListRequestDto): Promise<CategoryListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    )
    const { data } = await apiClient.get<CategoryListResponseDto>(CATEGORIES_ENDPOINTS.v1.get, { params })
    return data
  },

  getForSelect: async (): Promise<CategoryListResponseDto> => {
    const { data } = await apiClient.get<CategoryListResponseDto>(CATEGORIES_ENDPOINTS.v1.get, {
      params: { page: 1, per_page: 100 },
    })
    return data
  },

  post: async (param: CategoryPostRequestDto): Promise<CategoryPostResponseDto> => {
    const { data } = await apiClient.post<CategoryPostResponseDto>(CATEGORIES_ENDPOINTS.v1.post, param)
    return data
  },

  put: async (id: number, param: CategoryPutRequestDto): Promise<CategoryPutResponseDto> => {
    const { data } = await apiClient.put<CategoryPutResponseDto>(CATEGORIES_ENDPOINTS.v1.put(id), param)
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(CATEGORIES_ENDPOINTS.v1.delete(id))
    return data.success
  },
}
