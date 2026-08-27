import type { ProformaNoteApiItem } from './proformanote-api-item.dto'

export type ProformaNotePutRequestDto = {
  proforma_id?: number
  text?: string
  order?: number
}

export type ProformaNotePutResponseDto = {
  success: boolean
  status: number
  message: string
  data: ProformaNoteApiItem
  errors?: Record<string, string[]>
}
