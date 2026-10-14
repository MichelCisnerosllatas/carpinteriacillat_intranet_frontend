import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { FurnitureApiItem, FurnitureJoinApiItem } from './furniture-api-item.dto'

export type { FurnitureApiItem, FurnitureJoinApiItem }

export type FurnitureListRequestDto = {
  search?: string
  state?: number
  date_from?: string
  date_to?: string
  /** 1 = solo muebles visibles en la galería web (furniture_web state 1) · 0 = solo los no visibles. */
  web?: number
  per_page?: number
  page?: number
}

export type FurnitureListResponseDto = {
  success: boolean
  status: number
  message: string
  data: FurnitureApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}

export type FurnitureJoinListResponseDto = {
  success: boolean
  status: number
  message: string
  data: FurnitureJoinApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}

export type FurnitureGetByIdResponseDto = {
  success: boolean
  status: number
  message: string
  data: FurnitureJoinApiItem
}
