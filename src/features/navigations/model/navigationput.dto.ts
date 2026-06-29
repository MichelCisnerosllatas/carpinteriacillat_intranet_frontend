import type { NavigationApiItem } from './navigationget.dto'

export type NavigationPutRequestDto = {
  navigation_name: string
  navigation_url: string
  navigation_order: number
  navigation_state: number,
  navigation_updated_at: string
}

export type NavigationPutResponseDto = {
  success: boolean
  status: number
  message: string
  data: NavigationApiItem
  errors?: Record<string, string[]>
}
