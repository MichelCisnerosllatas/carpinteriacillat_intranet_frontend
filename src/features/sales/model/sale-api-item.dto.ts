// src/features/sales/model/sale-api-item.dto.ts

export type SaleStatusApi = 'GUARDADA' | 'EMITIDA' | 'ANULADA'
export type SalePaymentStatusApi = 'PENDIENTE' | 'PARCIAL' | 'PAGADO'

// Línea de detalle tal como viene en el join — definición propia (duplicada a propósito, igual
// que ProformaDetailApiItem en proformas/model/proforma-api-item.dto.ts) para no acoplar esta
// feature al modelo interno de sale-details; ambas solo se relacionan por id.
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

// Pago tal como viene en el join — de solo lectura por ahora (ver TODO(sale-payments) en
// sale-detail.tsx). El CRUD interactivo de pagos se agrega en un paso posterior.
export type SalePaymentApiItem = {
  id: number
  sale_id: number
  amount: number
  payment_date: string
  payment_method: string | null
  observation: string | null
  created_at: string
  updated_at: string | null
}

// Item plano — devuelto por GET /sales (sin relaciones). A diferencia de proformas, sales NO
// tiene motor de PDF ni campos de plantilla/firma/lugar de emisión/atención — ver sales.md.
export type SaleApiItem = {
  id: number
  client_id: number | null
  sale_document_type_id: number
  series: string
  correlative: number
  code: string
  issue_date: string
  issue_date_formatted: string | null
  due_date: string | null
  due_date_formatted: string | null
  // Solo se envía (opcionalmente) al crear — inmutable después. Ver salepost.dto.ts.
  is_taxed: boolean
  // Solo lectura — snapshot de la tasa de IGV aplicada por el servidor al crear.
  igv_rate_applied: number | null
  payment_method: string | null
  // subtotal/tax/total: solo lectura, recalculados en servidor desde sale_details.
  subtotal: number
  tax: number
  total: number
  // amount_paid/balance/payment_status: solo lectura, recalculados en servidor desde sale_payments.
  amount_paid: number
  balance: number
  payment_status: SalePaymentStatusApi
  currency: string
  status: SaleStatusApi
  observation: string | null
  created_at: string
  updated_at: string | null
}

// Item con relaciones — devuelto por GET /sales-join
export type SaleJoinApiItem = SaleApiItem & {
  client: {
    id: number
    business_name: string
  } | null
  sale_document_type: {
    id: number
    name: string
    code: string | null
  } | null
  details: SaleDetailApiItem[]
  payments: SalePaymentApiItem[]
}
