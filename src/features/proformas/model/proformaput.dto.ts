import type { ProformaApiItem } from './proforma-api-item.dto'
import type { ProformaPostRequestDto } from './proformapost.dto'

export type ProformaPutRequestDto = ProformaPostRequestDto

export type ProformaPutResponseDto = {
  success: boolean
  status: number
  message: string
  data: ProformaApiItem
  errors?: Record<string, string[]>
}
