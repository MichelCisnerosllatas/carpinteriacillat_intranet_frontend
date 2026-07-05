import type { ProformaDetailApiItem } from './proformadetail-api-item.dto'

export type ProformaDetailPostRequestDto = {
  proforma_id: number
  product_service_id?: number
  description: string
  unit?: string
  quantity: number
  unit_price: number
  tax?: number
  order?: number
}

export type ProformaDetailPostResponseDto = {
  success: boolean
  status: number
  message: string
  data: ProformaDetailApiItem
  errors?: Record<string, string[]>
}
