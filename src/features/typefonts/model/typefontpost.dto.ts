import type { TypeFontApiItem } from './typefontget.dto'

export type TypeFontPostRequestDto = {
  typefont_name: string
  typefont_description?: string
  typefont_state: number
  typefont_created_at: string
}

export type TypeFontPostResponseDto = {
  success: boolean
  status: number
  message: string
  data: TypeFontApiItem
  errors?: Record<string, string[]>
}
