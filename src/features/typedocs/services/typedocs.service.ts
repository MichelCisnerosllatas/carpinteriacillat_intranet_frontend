import apiClient from '@/shared/api/apiClient'
import { TYPEDOCS_ENDPOINTS } from './typedocs.endpoint'
import type { TypeDocListRequestDto, TypeDocListResponseDto } from '../model/typedocget.dto'
import type { TypeDocPostRequestDto, TypeDocPostResponseDto } from '../model/typedocpost.dto'
import type { TypeDocPutRequestDto, TypeDocPutResponseDto } from '../model/typedocput.dto'

export const typedocsService = {
  getList: async (param: TypeDocListRequestDto): Promise<TypeDocListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    )
    const { data } = await apiClient.get<TypeDocListResponseDto>(TYPEDOCS_ENDPOINTS.v1.get, { params })
    return data
  },

  getForSelect: async (): Promise<TypeDocListResponseDto> => {
    const { data } = await apiClient.get<TypeDocListResponseDto>(TYPEDOCS_ENDPOINTS.v1.get, {
      params: { page: 1, per_page: 100 },
    })
    return data
  },

  /** Igual que getForSelect, pero es la que consume useTypeDocModalSelectStore para <ModalSelect />. */
  getForModalSelect: async (): Promise<TypeDocListResponseDto> => {
    const { data } = await apiClient.get<TypeDocListResponseDto>(TYPEDOCS_ENDPOINTS.v1.get, {
      params: { page: 1, per_page: 100 },
    })
    return data
  },

  post: async (param: TypeDocPostRequestDto): Promise<TypeDocPostResponseDto> => {
    const { data } = await apiClient.post<TypeDocPostResponseDto>(TYPEDOCS_ENDPOINTS.v1.post, param)
    return data
  },

  put: async (id: number, param: TypeDocPutRequestDto): Promise<TypeDocPutResponseDto> => {
    const { data } = await apiClient.put<TypeDocPutResponseDto>(TYPEDOCS_ENDPOINTS.v1.put(id), param)
    return data
  },

  patch: async (id: number, param: Partial<TypeDocPutRequestDto>): Promise<TypeDocPutResponseDto> => {
    const { data } = await apiClient.patch<TypeDocPutResponseDto>(TYPEDOCS_ENDPOINTS.v1.patch(id), param)
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(TYPEDOCS_ENDPOINTS.v1.delete(id))
    return data.success
  },
}
