import type { ProformaNoteApiItem } from './proformanote-api-item.dto'

export type ProformaNotePostRequestDto = {
  proforma_id: number
  text: string
  order?: number
}

export type ProformaNotePostResponseDto = {
  success: boolean
  status: number
  message: string
  data: ProformaNoteApiItem
  errors?: Record<string, string[]>
}
