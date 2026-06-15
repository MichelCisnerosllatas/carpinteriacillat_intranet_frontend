import type { TypeDocApiItem } from './typedocget.dto'

export type TypeDocPostRequestDto = {
  typedoc_name: string
  typedoc_description?: string
  typedoc_state: number
  typedoc_created_at: string
}

export type TypeDocPostResponseDto = {
  success: boolean
  status: number
  message: string
  data: TypeDocApiItem
  errors?: Record<string, string[]>
}
