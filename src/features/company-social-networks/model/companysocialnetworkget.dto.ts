import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'

export type CompanySocialNetworkApiItem = {
  id: number
  name: string
  link: string
  show_on_website: boolean
  order: number
  status: number
  created_at: string
  updated_at: string | null
}

export type CompanySocialNetworkListRequestDto = {
  search?: string
  status?: number
  show_on_website?: number
  per_page?: number
  page?: number
}

export type CompanySocialNetworkListResponseDto = {
  success: boolean
  status: number
  message: string
  data: CompanySocialNetworkApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}
