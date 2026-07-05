import apiClient from '@/shared/api/apiClient'
import { PROFORMA_DETAILS_ENDPOINTS } from './proforma-details.endpoint'
import type { ProformaDetailListRequestDto, ProformaDetailListResponseDto } from '../model/proformadetailget.dto'
import type { ProformaDetailPostRequestDto, ProformaDetailPostResponseDto } from '../model/proformadetailpost.dto'
import type { ProformaDetailPutRequestDto, ProformaDetailPutResponseDto } from '../model/proformadetailput.dto'

export const proformaDetailsService = {
  getList: async (param: ProformaDetailListRequestDto): Promise<ProformaDetailListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    )
    const { data } = await apiClient.get<ProformaDetailListResponseDto>(PROFORMA_DETAILS_ENDPOINTS.v1.get, { params })
    return data
  },

  post: async (param: ProformaDetailPostRequestDto): Promise<ProformaDetailPostResponseDto> => {
    const { data } = await apiClient.post<ProformaDetailPostResponseDto>(PROFORMA_DETAILS_ENDPOINTS.v1.post, param)
    return data
  },

  put: async (id: number, param: ProformaDetailPutRequestDto): Promise<ProformaDetailPutResponseDto> => {
    const { data } = await apiClient.put<ProformaDetailPutResponseDto>(PROFORMA_DETAILS_ENDPOINTS.v1.put(id), param)
    return data
  },

  patch: async (id: number, param: Partial<ProformaDetailPutRequestDto>): Promise<ProformaDetailPutResponseDto> => {
    const { data } = await apiClient.patch<ProformaDetailPutResponseDto>(PROFORMA_DETAILS_ENDPOINTS.v1.patch(id), param)
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(PROFORMA_DETAILS_ENDPOINTS.v1.delete(id))
    return data.success
  },
}
