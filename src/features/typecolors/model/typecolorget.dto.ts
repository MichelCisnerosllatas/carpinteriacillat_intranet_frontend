import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'

export type TypeColorApiItem = {
  id_typecolor: number
  typecolor_name: string
  typecolor_code: string | null
  typecolor_hex: string | null
  typecolor_image: string | null
  typecolor_sort_order: number
  typecolor_description: string | null
  typecolor_state: number
  typecolor_created_at: string
  typecolor_updated_at: string | null
}

export type TypeColorListRequestDto = {
  search?: string
  state?: number
  date_from?: string
  date_to?: string
  per_page?: number
  page?: number
}

export type TypeColorListResponseDto = {
  success: boolean
  status: number
  message: string
  data: TypeColorApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}
