// src/features/proformas/model/proforma-api-item.dto.ts

export type ProformaStatusApi =
  | 'PENDIENTE'
  | 'ACEPTADA'
  | 'RECHAZADA'
  | 'ANULADA'
  | 'VENCIDA'
  | 'CONVERTIDA'

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

export type ProformaNoteApiItem = {
  id: number
  proforma_id: number
  text: string
  order: number | null
  created_at: string
  updated_at: string | null
}

// Item plano — devuelto por GET /proformas (sin relaciones)
export type ProformaApiItem = {
  id: number
  client_id: number | null
  template_id: number | null
  signature_id: number | null
  proforma_type_id: number | null
  series: string
  correlative: number
  code: string
  issue_date: string
  issue_date_formatted: string | null
  due_date: string | null
  due_date_formatted: string | null
  place_of_issue: string | null
  client_name: string | null
  client_document: string | null
  client_address: string | null
  client_attention: string | null
  company_business_name: string | null
  company_trade_name: string | null
  company_tax_id: string | null
  company_tax_address: string | null
  company_logo: string | null
  intro_text: string | null
  final_text: string | null
  final_greeting: string | null
  payment_method: string | null
  delivery_time: string | null
  subtotal: number
  tax: number
  total: number
  currency: string
  status: ProformaStatusApi
  observation: string | null
  created_at: string
  updated_at: string | null
}

// Item con relaciones — devuelto por GET /proformas-join
export type ProformaJoinApiItem = ProformaApiItem & {
  client: {
    id: number
    business_name: string
  } | null
  template: {
    id: number
    name: string
    texts: unknown[]
  } | null
  signature: {
    id: number
    signer_name: string
  } | null
  proforma_type: {
    id: number
    code: string | null
  } | null
  details: ProformaDetailApiItem[]
  // Opcional: el backend puede no incluirlo todavía si el eager-load de `notes` en
  // ProformaJoinResource se despliega más tarde — el mapeo trata la ausencia como lista vacía.
  notes?: ProformaNoteApiItem[]
}
