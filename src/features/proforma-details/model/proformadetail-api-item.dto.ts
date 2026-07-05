// src/features/proforma-details/model/proformadetail-api-item.dto.ts
export type ProformaDetailApiItem = {
  id: number
  proforma_id: number
  product_service_id: number | null
  description: string
  unit: string | null
  quantity: number
  unit_price: number
  subtotal: number
  tax: number | null
  total: number
  order: number | null
  created_at: string
  updated_at: string | null
}
