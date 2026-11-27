import apiClient from '@/shared/api/apiClient'
import { SELLERS_ENDPOINTS } from './sellers.endpoint'
import type { SellerListResponseDto } from '../model/sellerget.dto'

export const sellersService = {
  // Lista corta (sin paginar) de vendedores activos para filtros y selectores.
  getList: async (): Promise<SellerListResponseDto> => {
    const { data } = await apiClient.get<SellerListResponseDto>(SELLERS_ENDPOINTS.v1.get)
    return data
  },
}
