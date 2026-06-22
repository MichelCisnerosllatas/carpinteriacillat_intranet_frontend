import type { NavigationApiItem } from './navigationget.dto'

export type NavigationPostRequestDto = {
  navigation_name: string
  navigation_url?: string
  navigation_order?: number
  navigation_state: number
  navigation_created_at?: string
}

export type NavigationPostResponseDto = {
  success: boolean
  status: number
  message: string
  data: NavigationApiItem
  errors?: Record<string, string[]>
}
