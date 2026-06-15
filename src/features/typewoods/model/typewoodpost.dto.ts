import type { TypeWoodApiItem } from './typewoodget.dto'

export type TypeWoodPostRequestDto = {
  typewood_name: string
  typewood_description?: string
  typewood_state: number
  typewood_created_at: string
}

export type TypeWoodPostResponseDto = {
  success: boolean
  status: number
  message: string
  data: TypeWoodApiItem
  errors?: Record<string, string[]>
}
