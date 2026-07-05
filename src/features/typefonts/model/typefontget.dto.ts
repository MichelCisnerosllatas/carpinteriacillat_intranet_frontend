import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'

export type TypeFontApiItem = {
  id_typefont: number
  typefont_name: string
  typefont_description: string | null
  typefont_state: number
  typefont_created_at: string
  typefont_updated_at: string | null
}

export type TypeFontListRequestDto = {
  search?: string
  state?: number
  date_from?: string
  date_to?: string
  per_page?: number
  page?: number
}

export type TypeFontListResponseDto = {
  success: boolean
  status: number
  message: string
  data: TypeFontApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}
