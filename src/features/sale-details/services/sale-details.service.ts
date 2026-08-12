import apiClient from '@/shared/api/apiClient'
import { SALE_DETAILS_ENDPOINTS } from './sale-details.endpoint'
import type { SaleDetailListRequestDto, SaleDetailListResponseDto } from '../model/saledetailget.dto'
import type { SaleDetailPostRequestDto, SaleDetailPostResponseDto } from '../model/saledetailpost.dto'
import type { SaleDetailPutRequestDto, SaleDetailPutResponseDto } from '../model/saledetailput.dto'

// Endpoint plano (sin relaciones), filtrable por `sale_id` — usado para leer las líneas de una
// venta en el carrito de edición. `/sale-details-join` es un endpoint aparte para listados
// administrativos, no se usa acá (ver sale-details.md).
export const saleDetailsService = {
  getList: async (param: SaleDetailListRequestDto): Promise<SaleDetailListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([, v]) => v !== undefined && v !== null && v !== '')
    )
    const { data } = await apiClient.get<SaleDetailListResponseDto>(SALE_DETAILS_ENDPOINTS.v1.get, { params })
    return data
  },

  post: async (param: SaleDetailPostRequestDto): Promise<SaleDetailPostResponseDto> => {
    const { data } = await apiClient.post<SaleDetailPostResponseDto>(SALE_DETAILS_ENDPOINTS.v1.post, param)
    return data
  },

  put: async (id: number, param: SaleDetailPutRequestDto): Promise<SaleDetailPutResponseDto> => {
    const { data } = await apiClient.put<SaleDetailPutResponseDto>(SALE_DETAILS_ENDPOINTS.v1.put(id), param)
    return data
  },

  patch: async (id: number, param: Partial<SaleDetailPutRequestDto>): Promise<SaleDetailPutResponseDto> => {
    const { data } = await apiClient.patch<SaleDetailPutResponseDto>(SALE_DETAILS_ENDPOINTS.v1.patch(id), param)
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(SALE_DETAILS_ENDPOINTS.v1.delete(id))
    return data.success
  },
}
