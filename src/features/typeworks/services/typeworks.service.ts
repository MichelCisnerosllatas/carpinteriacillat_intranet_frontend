import apiClient from '@/shared/api/apiClient'
import { TYPEWORKS_ENDPOINTS } from './typeworks.endpoint'
import type { TypeWorkListRequestDto, TypeWorkListResponseDto } from '../model/typeworkget.dto'
import type { TypeWorkPostRequestDto, TypeWorkPostResponseDto } from '../model/typeworkpost.dto'
import type { TypeWorkPutRequestDto, TypeWorkPutResponseDto } from '../model/typeworkput.dto'

export const typeworksService = {
  getList: async (param: TypeWorkListRequestDto): Promise<TypeWorkListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    )
    const { data } = await apiClient.get<TypeWorkListResponseDto>(TYPEWORKS_ENDPOINTS.v1.get, { params })
    return data
  },

  getForSelect: async (): Promise<TypeWorkListResponseDto> => {
    const { data } = await apiClient.get<TypeWorkListResponseDto>(TYPEWORKS_ENDPOINTS.v1.get, {
      params: { page: 1, per_page: 100 },
    })
    return data
  },

  /** Igual que getForSelect, pero es la que consume useTypeWorkModalSelectStore para <ModalSelect />. */
  getForModalSelect: async (): Promise<TypeWorkListResponseDto> => {
    const { data } = await apiClient.get<TypeWorkListResponseDto>(TYPEWORKS_ENDPOINTS.v1.get, {
      params: { page: 1, per_page: 100 },
    })
    return data
  },

  post: async (param: TypeWorkPostRequestDto): Promise<TypeWorkPostResponseDto> => {
    const { data } = await apiClient.post<TypeWorkPostResponseDto>(TYPEWORKS_ENDPOINTS.v1.post, param)
    return data
  },

  put: async (id: number, param: TypeWorkPutRequestDto): Promise<TypeWorkPutResponseDto> => {
    const { data } = await apiClient.put<TypeWorkPutResponseDto>(TYPEWORKS_ENDPOINTS.v1.put(id), param)
    return data
  },

  patch: async (id: number, param: Partial<TypeWorkPutRequestDto>): Promise<TypeWorkPutResponseDto> => {
    const { data } = await apiClient.patch<TypeWorkPutResponseDto>(TYPEWORKS_ENDPOINTS.v1.patch(id), param)
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(TYPEWORKS_ENDPOINTS.v1.delete(id))
    return data.success
  },
}
