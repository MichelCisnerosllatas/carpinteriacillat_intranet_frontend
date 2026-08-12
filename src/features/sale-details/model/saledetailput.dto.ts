import type { SaleDetailApiItem } from './sale-detail-api-item.dto'

// tax NUNCA se envía — mismo motivo que en saledetailpost.dto.ts.
export type SaleDetailPutRequestDto = {
  sale_id?: number
  product_service_id?: number
  description?: string
  unit?: string
  quantity?: number
  unit_price?: number
  order?: number
}

export type SaleDetailPutResponseDto = {
  success: boolean
  status: number
  message: string
  data: SaleDetailApiItem
  errors?: Record<string, string[]>
}
