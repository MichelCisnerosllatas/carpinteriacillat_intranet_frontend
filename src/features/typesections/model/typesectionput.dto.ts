import type { TypeSectionApiItem } from './typesectionget.dto'

export type TypeSectionPutRequestDto = {
  typesection_name: string
  typesection_description: string
  typesection_state: number
  typesection_updated_at: string
}

export type TypeSectionPutResponseDto = {
  success: boolean
  status: number
  message: string
  data: TypeSectionApiItem
  errors?: Record<string, string[]>
}
