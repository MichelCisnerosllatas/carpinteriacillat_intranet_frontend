import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'

export type CategoryApiItem = {
  id_category: number
  category_name: string
  category_description: string | null
  category_state: number
  category_created_at: string
  category_updated_at: string | null
}

export type CategoryListRequestDto = {
  search?: string
  state?: number
  date_from?: string
  date_to?: string
  per_page?: number
  page?: number
}

export type CategoryListResponseDto = {
  success: boolean
  status: number
  message: string
  data: CategoryApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}
