import type { ProformaTypeApiItem } from './proformatypeget.dto'

export type ProformaTypePutRequestDto = {
  name: string
  code?: string
  status: number
}

export type ProformaTypePutResponseDto = {
  success: boolean
  status: number
  message: string
  data: ProformaTypeApiItem
  errors?: Record<string, string[]>
}
