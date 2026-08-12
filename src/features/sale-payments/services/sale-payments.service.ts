import apiClient from '@/shared/api/apiClient'
import { SALE_PAYMENTS_ENDPOINTS } from './sale-payments.endpoint'
import type { SalePaymentListRequestDto, SalePaymentListResponseDto } from '../model/salepaymentget.dto'
import type { SalePaymentPostRequestDto, SalePaymentPostResponseDto } from '../model/salepaymentpost.dto'
import type { SalePaymentPutRequestDto, SalePaymentPutResponseDto } from '../model/salepaymentput.dto'

export const salePaymentsService = {
  getList: async (param: SalePaymentListRequestDto): Promise<SalePaymentListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([, v]) => v !== undefined && v !== null)
    )
    const { data } = await apiClient.get<SalePaymentListResponseDto>(SALE_PAYMENTS_ENDPOINTS.v1.get, { params })
    return data
  },

  post: async (param: SalePaymentPostRequestDto): Promise<SalePaymentPostResponseDto> => {
    const { data } = await apiClient.post<SalePaymentPostResponseDto>(SALE_PAYMENTS_ENDPOINTS.v1.post, param)
    return data
  },

  put: async (id: number, param: SalePaymentPutRequestDto): Promise<SalePaymentPutResponseDto> => {
    const { data } = await apiClient.put<SalePaymentPutResponseDto>(SALE_PAYMENTS_ENDPOINTS.v1.put(id), param)
    return data
  },

  patch: async (id: number, param: Partial<SalePaymentPutRequestDto>): Promise<SalePaymentPutResponseDto> => {
    const { data } = await apiClient.patch<SalePaymentPutResponseDto>(SALE_PAYMENTS_ENDPOINTS.v1.patch(id), param)
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(SALE_PAYMENTS_ENDPOINTS.v1.delete(id))
    return data.success
  },
}
