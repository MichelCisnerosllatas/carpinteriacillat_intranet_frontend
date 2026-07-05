import type { ProformaApiItem, ProformaStatusApi } from './proforma-api-item.dto'

export type ProformaDetailPostDto = {
  product_service_id?: number
  description: string
  unit?: string
  quantity: number
  unit_price: number
  tax?: number
  order?: number
}

// series, correlative y code NUNCA se envían — el servidor los genera siempre.
export type ProformaPostRequestDto = {
  client_id?: number
  template_id?: number
  signature_id?: number
  proforma_type_id?: number
  series?: string
  issue_date: string
  due_date?: string
  place_of_issue?: string
  client_attention?: string
  delivery_time?: string
  currency?: string
  status?: ProformaStatusApi
  observation?: string
  details?: ProformaDetailPostDto[]
}

export type ProformaPostResponseDto = {
  success: boolean
  status: number
  message: string
  data: ProformaApiItem
  errors?: Record<string, string[]>
}
