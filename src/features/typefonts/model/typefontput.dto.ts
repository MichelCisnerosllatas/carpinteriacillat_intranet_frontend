import type { TypeFontApiItem } from './typefontget.dto'

export type TypeFontPutRequestDto = {
  typefont_name: string
  typefont_description: string
  typefont_state: number
  typefont_updated_at: string
}

export type TypeFontPutResponseDto = {
  success: boolean
  status: number
  message: string
  data: TypeFontApiItem
  errors?: Record<string, string[]>
}
