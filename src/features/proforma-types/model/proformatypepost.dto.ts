import type { ProformaTypeApiItem } from './proformatypeget.dto'

export type ProformaTypePostRequestDto = {
  name: string
  code?: string
  status?: number
}

export type ProformaTypePostResponseDto = {
  success: boolean
  status: number
  message: string
  data: ProformaTypeApiItem
  errors?: Record<string, string[]>
}
