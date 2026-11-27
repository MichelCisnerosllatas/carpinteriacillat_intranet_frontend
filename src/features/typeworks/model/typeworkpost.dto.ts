import type { TypeWorkApiItem } from './typeworkget.dto'

export type TypeWorkPostRequestDto = {
  /** Solo minúsculas, números y guion bajo (^[a-z0-9_]+$). Se fija al crear. */
  typework_key: string
  typework_name: string
  typework_description?: string | null
  typework_state: number
  typework_created_at: string
}

export type TypeWorkPostResponseDto = {
  success: boolean
  status: number
  message: string
  data: TypeWorkApiItem
  errors?: Record<string, string[]>
}
