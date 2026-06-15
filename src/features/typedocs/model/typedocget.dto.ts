import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'

export type TypeDocApiItem = {
  id_typedoc: number
  typedoc_name: string
  typedoc_description: string | null
  typedoc_state: number
  typedoc_created_at: string
  typedoc_updated_at: string | null
}

export type TypeDocListRequestDto = {
  search?: string
  state?: number
  date_from?: string
  date_to?: string
  per_page?: number
  page?: number
}

export type TypeDocListResponseDto = {
  success: boolean
  status: number
  message: string
  data: TypeDocApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}
