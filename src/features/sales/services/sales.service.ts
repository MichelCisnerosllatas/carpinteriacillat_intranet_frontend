import apiClient from '@/shared/api/apiClient'
import { SALES_ENDPOINTS } from './sales.endpoint'
import type {
  SaleListRequestDto,
  SaleJoinListResponseDto,
  SaleGetByIdResponseDto,
} from '../model/saleget.dto'
import type { SalePostRequestDto, SalePostResponseDto } from '../model/salepost.dto'
import type { SalePutRequestDto, SalePutResponseDto } from '../model/saleput.dto'

// Sales NO tiene motor de PDF — a diferencia de proformas.service.ts, no hay viewPdf/downloadPdf/
// getPreviewStylePdf ni timeouts especiales para regeneración de documentos.
export const salesService = {
  // Tabla principal y detalle: usa el endpoint -join (cliente, tipo de comprobante y detalles/pagos).
  getList: async (param: SaleListRequestDto): Promise<SaleJoinListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([, v]) => v !== undefined && v !== null && v !== '')
    )
    const { data } = await apiClient.get<SaleJoinListResponseDto>(SALES_ENDPOINTS.v1.getJoin, {
      params,
    })
    return data
  },

  getById: async (id: number): Promise<SaleGetByIdResponseDto> => {
    const { data } = await apiClient.get<SaleGetByIdResponseDto>(
      `${SALES_ENDPOINTS.v1.getJoin}/${id}`
    )
    return data
  },

  post: async (param: SalePostRequestDto): Promise<SalePostResponseDto> => {
    const { data } = await apiClient.post<SalePostResponseDto>(SALES_ENDPOINTS.v1.post, param)
    return data
  },

  put: async (id: number, param: SalePutRequestDto): Promise<SalePutResponseDto> => {
    const { data } = await apiClient.put<SalePutResponseDto>(SALES_ENDPOINTS.v1.put(id), param)
    return data
  },

  patch: async (id: number, param: Partial<SalePutRequestDto>): Promise<SalePutResponseDto> => {
    const { data } = await apiClient.patch<SalePutResponseDto>(SALES_ENDPOINTS.v1.patch(id), param)
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(SALES_ENDPOINTS.v1.delete(id))
    return data.success
  },
}
