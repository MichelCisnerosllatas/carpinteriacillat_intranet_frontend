import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'

export type TypeWoodApiItem = {
  id_typewood: number
  typewood_name: string
  typewood_description: string | null
  typewood_state: number
  typewood_created_at: string
  typewood_updated_at: string | null
}

export type TypeWoodListRequestDto = {
  search?: string
  state?: number
  date_from?: string
  date_to?: string
  per_page?: number
  page?: number
}

export type TypeWoodListResponseDto = {
  success: boolean
  status: number
  message: string
  data: TypeWoodApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}
