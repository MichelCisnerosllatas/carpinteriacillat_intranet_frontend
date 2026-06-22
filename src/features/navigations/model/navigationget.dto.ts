import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'

export type NavigationApiItem = {
  id_navigation: number
  navigation_name: string
  navigation_url: string
  navigation_order: number
  navigation_state: number
  navigation_created_at: string
  navigation_updated_at: string | null
}

export type NavigationListRequestDto = {
  search?: string
  state?: number
  per_page?: number
  page?: number
}

export type NavigationListResponseDto = {
  success: boolean
  status: number
  message: string
  data: NavigationApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}
