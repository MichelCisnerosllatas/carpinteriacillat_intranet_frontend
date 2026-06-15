import type { TypeColorApiItem } from './typecolorget.dto'

export type TypeColorPutRequestDto = {
  typecolor_name: string
  typecolor_description: string
  typecolor_state: number
  typecolor_updated_at: string
}

export type TypeColorPutResponseDto = {
  success: boolean
  status: number
  message: string
  data: TypeColorApiItem
  errors?: Record<string, string[]>
}
