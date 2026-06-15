import type { TypeColorApiItem } from './typecolorget.dto'

export type TypeColorPostRequestDto = {
  typecolor_name: string
  typecolor_description?: string
  typecolor_state: number
  typecolor_created_at: string
}

export type TypeColorPostResponseDto = {
  success: boolean
  status: number
  message: string
  data: TypeColorApiItem
  errors?: Record<string, string[]>
}
