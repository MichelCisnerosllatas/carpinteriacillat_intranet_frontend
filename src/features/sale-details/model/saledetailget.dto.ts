import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { SaleDetailApiItem } from './sale-detail-api-item.dto'

export type { SaleDetailApiItem }

export type SaleDetailListRequestDto = {
  search?: string
  sale_id?: number
  per_page?: number
  page?: number
}

export type SaleDetailListResponseDto = {
  success: boolean
  status: number
  message: string
  data: SaleDetailApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}
