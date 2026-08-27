import type { ProformaApiItem, ProformaStatusApi } from './proforma-api-item.dto'

// series, correlative y code NUNCA se envían — el servidor los genera siempre.
// details NUNCA se envía — /proformas ya no acepta detalles anidados, se gestionan
// aparte vía /proforma-details (ver features/proforma-details).
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
  payment_method?: string
}

export type ProformaPostResponseDto = {
  success: boolean
  status: number
  message: string
  data: ProformaApiItem
  errors?: Record<string, string[]>
}
