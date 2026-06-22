import type { CategoryApiItem } from './categoryget.dto'

export type CategoryPostRequestDto = {
  category_name: string
  category_description?: string
  category_state: string
  category_created_at: string
}

export type CategoryPostResponseDto = {
  success: boolean
  status: number
  message: string
  data: CategoryApiItem
  errors?: Record<string, string[]>
}
