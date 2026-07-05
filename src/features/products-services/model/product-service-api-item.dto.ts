// src/features/products-services/model/product-service-api-item.dto.ts
export type ProductServiceType = 'product' | 'service'

export type ProductServiceApiItem = {
  id: number
  furniture_id: number | null
  name: string
  description: string | null
  unit: string | null
  default_price: number
  type: ProductServiceType
  status: number
  created_at: string
  updated_at: string | null
}

export type ProductServiceJoinApiItem = ProductServiceApiItem & {
  furniture: {
    id_furniture: number
    furniture_name: string
  } | null
}
