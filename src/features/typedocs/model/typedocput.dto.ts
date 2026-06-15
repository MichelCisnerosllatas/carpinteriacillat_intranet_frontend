import type { TypeDocApiItem } from './typedocget.dto'

export type TypeDocPutRequestDto = {
  typedoc_name: string
  typedoc_description: string
  typedoc_state: number
  typedoc_updated_at: string
}

export type TypeDocPutResponseDto = {
  success: boolean
  status: number
  message: string
  data: TypeDocApiItem
  errors?: Record<string, string[]>
}
