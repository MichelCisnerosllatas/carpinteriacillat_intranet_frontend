import apiClient from '@/shared/api/apiClient'
import { SALE_DOCUMENT_TYPES_ENDPOINTS } from './sale-document-types.endpoint'
import type { SaleDocumentTypeListRequestDto, SaleDocumentTypeListResponseDto, SaleDocumentTypeGetByIdResponseDto } from '../model/saledocumenttypeget.dto'
import type { SaleDocumentTypePostRequestDto, SaleDocumentTypePostResponseDto } from '../model/saledocumenttypepost.dto'
import type { SaleDocumentTypePutRequestDto, SaleDocumentTypePutResponseDto } from '../model/saledocumenttypeput.dto'

export const saleDocumentTypesService = {
  getList: async (param: SaleDocumentTypeListRequestDto): Promise<SaleDocumentTypeListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    )
    const { data } = await apiClient.get<SaleDocumentTypeListResponseDto>(SALE_DOCUMENT_TYPES_ENDPOINTS.v1.get, { params })
    return data
  },

  getForSelect: async (): Promise<SaleDocumentTypeListResponseDto> => {
    const { data } = await apiClient.get<SaleDocumentTypeListResponseDto>(SALE_DOCUMENT_TYPES_ENDPOINTS.v1.get, {
      params: { page: 1, per_page: 100 },
    })
    return data
  },

  getById: async (id: number): Promise<SaleDocumentTypeGetByIdResponseDto> => {
    const { data } = await apiClient.get<SaleDocumentTypeGetByIdResponseDto>(`${SALE_DOCUMENT_TYPES_ENDPOINTS.v1.get}/${id}`)
    return data
  },

  post: async (param: SaleDocumentTypePostRequestDto): Promise<SaleDocumentTypePostResponseDto> => {
    const { data } = await apiClient.post<SaleDocumentTypePostResponseDto>(SALE_DOCUMENT_TYPES_ENDPOINTS.v1.post, param)
    return data
  },

  put: async (id: number, param: SaleDocumentTypePutRequestDto): Promise<SaleDocumentTypePutResponseDto> => {
    const { data } = await apiClient.put<SaleDocumentTypePutResponseDto>(SALE_DOCUMENT_TYPES_ENDPOINTS.v1.put(id), param)
    return data
  },

  patch: async (id: number, param: Partial<SaleDocumentTypePutRequestDto>): Promise<SaleDocumentTypePutResponseDto> => {
    const { data } = await apiClient.patch<SaleDocumentTypePutResponseDto>(SALE_DOCUMENT_TYPES_ENDPOINTS.v1.patch(id), param)
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(SALE_DOCUMENT_TYPES_ENDPOINTS.v1.delete(id))
    return data.success
  },
}
