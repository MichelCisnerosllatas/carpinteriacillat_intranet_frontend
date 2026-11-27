import apiClient from '@/shared/api/apiClient'
import { SALE_GOALS_ENDPOINTS } from './sale-goals.endpoint'
import type {
  SaleGoalListRequestDto,
  SaleGoalListResponseDto,
  SaleGoalPutRequestDto,
  SaleGoalPutResponseDto,
} from '../model/salegoal.dto'

export const saleGoalsService = {
  getList: async (params: SaleGoalListRequestDto): Promise<SaleGoalListResponseDto> => {
    const { data } = await apiClient.get<SaleGoalListResponseDto>(SALE_GOALS_ENDPOINTS.v1.get, {
      params,
    })
    return data
  },

  // Guarda los 12 meses de una vez (upsert en el backend).
  put: async (param: SaleGoalPutRequestDto): Promise<SaleGoalPutResponseDto> => {
    const { data } = await apiClient.put<SaleGoalPutResponseDto>(SALE_GOALS_ENDPOINTS.v1.put, param)
    return data
  },
}
