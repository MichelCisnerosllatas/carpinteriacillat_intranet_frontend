import apiClient from '@/shared/api/apiClient'
import { PROFORMA_TYPES_ENDPOINTS } from './proforma-types.endpoint'
import type { ProformaTypeListRequestDto, ProformaTypeListResponseDto, ProformaTypeGetByIdResponseDto } from '../model/proformatypeget.dto'
import type { ProformaTypePostRequestDto, ProformaTypePostResponseDto } from '../model/proformatypepost.dto'
import type { ProformaTypePutRequestDto, ProformaTypePutResponseDto } from '../model/proformatypeput.dto'

export const proformaTypesService = {
  getList: async (param: ProformaTypeListRequestDto): Promise<ProformaTypeListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    )
    const { data } = await apiClient.get<ProformaTypeListResponseDto>(PROFORMA_TYPES_ENDPOINTS.v1.get, { params })
    return data
  },

  getForSelect: async (): Promise<ProformaTypeListResponseDto> => {
    const { data } = await apiClient.get<ProformaTypeListResponseDto>(PROFORMA_TYPES_ENDPOINTS.v1.get, {
      params: { page: 1, per_page: 100 },
    })
    return data
  },

  /** Igual que getForSelect, pero es la que consume useProformaTypeModalSelectStore para <ModalSelect />. */
  getForModalSelect: async (): Promise<ProformaTypeListResponseDto> => {
    const { data } = await apiClient.get<ProformaTypeListResponseDto>(PROFORMA_TYPES_ENDPOINTS.v1.get, {
      params: { page: 1, per_page: 100 },
    })
    return data
  },

  getById: async (id: number): Promise<ProformaTypeGetByIdResponseDto> => {
    const { data } = await apiClient.get<ProformaTypeGetByIdResponseDto>(`${PROFORMA_TYPES_ENDPOINTS.v1.get}/${id}`)
    return data
  },

  post: async (param: ProformaTypePostRequestDto): Promise<ProformaTypePostResponseDto> => {
    const { data } = await apiClient.post<ProformaTypePostResponseDto>(PROFORMA_TYPES_ENDPOINTS.v1.post, param)
    return data
  },

  put: async (id: number, param: ProformaTypePutRequestDto): Promise<ProformaTypePutResponseDto> => {
    const { data } = await apiClient.put<ProformaTypePutResponseDto>(PROFORMA_TYPES_ENDPOINTS.v1.put(id), param)
    return data
  },

  patch: async (id: number, param: Partial<ProformaTypePutRequestDto>): Promise<ProformaTypePutResponseDto> => {
    const { data } = await apiClient.patch<ProformaTypePutResponseDto>(PROFORMA_TYPES_ENDPOINTS.v1.patch(id), param)
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(PROFORMA_TYPES_ENDPOINTS.v1.delete(id))
    return data.success
  },
}
