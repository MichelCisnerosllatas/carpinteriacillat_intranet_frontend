import type { SaleDetailApiItem } from './sale-detail-api-item.dto'

// tax NUNCA se envía — el servidor SIEMPRE lo calcula (diferencia clave con
// proforma-details, cuyo POST sí acepta un `tax` editable). No agregues ese campo acá.
export type SaleDetailPostRequestDto = {
  sale_id: number
  product_service_id?: number
  description: string
  unit?: string
  quantity: number
  unit_price: number
  order?: number
}

export type SaleDetailPostResponseDto = {
  success: boolean
  status: number
  message: string
  data: SaleDetailApiItem
  errors?: Record<string, string[]>
}
