import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { ProductServiceApiItem, ProductServiceJoinApiItem, ProductServiceType } from './product-service-api-item.dto'

export type { ProductServiceApiItem, ProductServiceJoinApiItem, ProductServiceType }

export type ProductServiceListRequestDto = {
  search?: string
  type?: ProductServiceType
  status?: number
  per_page?: number
  page?: number
}

export type ProductServiceListResponseDto = {
  success: boolean
  status: number
  message: string
  data: ProductServiceApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}

export type ProductServiceJoinListResponseDto = {
  success: boolean
  status: number
  message: string
  data: ProductServiceJoinApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}

export type ProductServiceGetByIdResponseDto = {
  success: boolean
  status: number
  message: string
  data: ProductServiceJoinApiItem
}
