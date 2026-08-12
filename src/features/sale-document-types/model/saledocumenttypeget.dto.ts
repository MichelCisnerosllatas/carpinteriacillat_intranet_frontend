import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'

export type SaleDocumentTypeApiItem = {
  id: number
  name: string
  code: string | null
  series: string
  status: number
  created_at: string
  updated_at: string | null
}

export type SaleDocumentTypeListRequestDto = {
  search?: string
  status?: number
  per_page?: number
  page?: number
}

export type SaleDocumentTypeListResponseDto = {
  success: boolean
  status: number
  message: string
  data: SaleDocumentTypeApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}

export type SaleDocumentTypeGetByIdResponseDto = {
  success: boolean
  status: number
  message: string
  data: SaleDocumentTypeApiItem
}
