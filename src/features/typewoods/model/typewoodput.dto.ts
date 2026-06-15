import type { TypeWoodApiItem } from './typewoodget.dto'

export type TypeWoodPutRequestDto = {
  typewood_name: string
  typewood_description: string
  typewood_state: number
  typewood_updated_at: string
}

export type TypeWoodPutResponseDto = {
  success: boolean
  status: number
  message: string
  data: TypeWoodApiItem
  errors?: Record<string, string[]>
}
