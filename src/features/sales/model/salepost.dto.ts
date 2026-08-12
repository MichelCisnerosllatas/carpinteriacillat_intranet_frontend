import type { SaleApiItem } from './sale-api-item.dto'

// series, correlative y code NUNCA se envían — el servidor los genera siempre (a diferencia de
// proformas, que sí admite una `series` propia opcional). details NUNCA se envía — se gestionan
// aparte vía /sale-details (ver features/sale-details). subtotal/tax/total/amount_paid/balance/
// payment_status son de solo lectura y jamás forman parte de este payload.
export type SalePostRequestDto = {
  client_id?: number
  sale_document_type_id: number
  issue_date: string
  due_date?: string
  // Opcional — 3 estados posibles: omitido (usa la config. por defecto del sistema), true o
  // false. SOLO tiene efecto al crear — inmutable después (ver salepost.dto.ts / sale-form).
  is_taxed?: boolean
  payment_method?: string
  currency?: string
  observation?: string
}

export type SalePostResponseDto = {
  success: boolean
  status: number
  message: string
  data: SaleApiItem
  errors?: Record<string, string[]>
}
