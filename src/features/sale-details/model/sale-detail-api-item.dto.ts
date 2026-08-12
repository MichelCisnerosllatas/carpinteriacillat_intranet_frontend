// src/features/sale-details/model/sale-detail-api-item.dto.ts

// tax es de SOLO LECTURA — el cliente nunca lo envía, siempre lo calcula el servidor (a
// diferencia de proforma-details, cuyo tax sí es editable por el cliente). Ver sale-details.md.
export type SaleDetailApiItem = {
  id: number
  sale_id: number
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
