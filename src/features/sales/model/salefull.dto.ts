// src/features/sales/model/salefull.dto.ts
import type { SaleJoinApiItem, SaleStatusApi } from './sale-api-item.dto'

// Venta completa en UNA sola petición (contrato §4): cabecera + líneas + pagos en una transacción.
// Reemplaza el flujo viejo de 3 etapas (cabecera → líneas una por una → pagos).

export type SaleFullDetailDto = {
  /** Solo en PUT: con id = actualiza esa línea, sin id = línea nueva. Las que no vienen se borran. */
  id?: number
  product_service_id: number | null
  description: string
  unit: string | null
  quantity: number
  unit_price: number
  /** Monto (no %) — 0 ≤ discount ≤ round(cantidad × precio, 2). */
  discount: number
}

export type SaleFullPaymentDto = {
  amount: number
  payment_date: string
  payment_method: string
  observation: string | null
}

export type SaleFullPostRequestDto = {
  /** null = "Cliente varios" (el backend lo rechaza si el comprobante es factura, code "01"). */
  client_id: number | null
  sale_document_type_id: number
  issue_date: string
  currency: string
  observation?: string
  proforma_id?: number
  /** Vendedor (contrato §11.1). Solo se respeta con `sales.view_all`; si no, el backend usa
   * al usuario autenticado. */
  user_id?: number
  status?: SaleStatusApi
  details: SaleFullDetailDto[]
  payments?: SaleFullPaymentDto[]
}

// PUT /sales/{id}/full: mismo body SIN proforma_id ni payments (los pagos de una venta existente
// se siguen manejando con /sale-payments).
export type SaleFullPutRequestDto = Omit<SaleFullPostRequestDto, 'proforma_id' | 'payments'>

export type SaleFullResponseDto = {
  success: boolean
  status: number
  message: string
  data: SaleJoinApiItem
  errors?: Record<string, string[]>
}
