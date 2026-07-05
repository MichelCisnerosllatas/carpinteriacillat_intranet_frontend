import type { ProductServiceApiItem, ProductServiceType } from './product-service-api-item.dto'

export type ProductServicePostRequestDto = {
  furniture_id?: number | null
  name: string
  description?: string
  unit?: string
  default_price?: number
  type?: ProductServiceType
  status?: number
}

export type ProductServicePostResponseDto = {
  success: boolean
  status: number
  message: string
  data: ProductServiceApiItem
  errors?: Record<string, string[]>
}
