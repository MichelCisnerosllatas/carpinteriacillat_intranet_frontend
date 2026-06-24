import type { TypeColorApiItem } from './typecolorget.dto'

export type TypeColorPostRequestDto = {
  typecolor_name: string
  typecolor_code?: string
  typecolor_hex?: string
  typecolor_image?: string
  typecolor_sort_order?: number
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
