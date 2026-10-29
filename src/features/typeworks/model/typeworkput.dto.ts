import type { TypeWorkApiItem } from './typeworkget.dto'

/** `typework_key` no viaja: la API no permite cambiarla. */
export type TypeWorkPutRequestDto = {
  typework_name: string
  typework_description: string | null
  typework_state: number
  typework_updated_at: string
}

export type TypeWorkPutResponseDto = {
  success: boolean
  status: number
  message: string
  data: TypeWorkApiItem
  errors?: Record<string, string[]>
}
