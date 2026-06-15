import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'

export type TypeSectionApiItem = {
  id_typesection: number
  typesection_name: string
  typesection_description: string | null
  typesection_state: number
  typesection_created_at: string
  typesection_updated_at: string | null
}

export type TypeSectionListRequestDto = {
  search?: string
  state?: number
  date_from?: string
  date_to?: string
  per_page?: number
  page?: number
}

export type TypeSectionListResponseDto = {
  success: boolean
  status: number
  message: string
  data: TypeSectionApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}
