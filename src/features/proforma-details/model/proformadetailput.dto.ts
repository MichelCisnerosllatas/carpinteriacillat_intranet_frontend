import type { ProformaDetailApiItem } from './proformadetail-api-item.dto'

export type ProformaDetailPutRequestDto = {
  proforma_id?: number
  product_service_id?: number
  description?: string
  unit?: string
  quantity?: number
  unit_price?: number
  tax?: number
  order?: number
}

export type ProformaDetailPutResponseDto = {
  success: boolean
  status: number
  message: string
  data: ProformaDetailApiItem
  errors?: Record<string, string[]>
}
