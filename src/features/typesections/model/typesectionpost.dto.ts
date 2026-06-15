import type { TypeSectionApiItem } from './typesectionget.dto'

export type TypeSectionPostRequestDto = {
  typesection_name: string
  typesection_description?: string
  typesection_state: number
  typesection_created_at: string
}

export type TypeSectionPostResponseDto = {
  success: boolean
  status: number
  message: string
  data: TypeSectionApiItem
  errors?: Record<string, string[]>
}
