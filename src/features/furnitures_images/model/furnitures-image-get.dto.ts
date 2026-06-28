import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { FurnitureImageApiItem, FurnitureImageJoinApiItem } from './furnitures-image-api-item.dto'

export type FurnitureImageListRequestDto = {
  id_furniture?: number
  state?: number
  per_page?: number
  page?: number
}

export type FurnitureImageListResponseDto = {
  success: boolean
  status: number
  message: string
  data: FurnitureImageApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}

export type FurnitureImageJoinListResponseDto = {
  success: boolean
  status: number
  message: string
  data: FurnitureImageJoinApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}

export type FurnitureImageGetByIdResponseDto = {
  success: boolean
  status: number
  message: string
  data: FurnitureImageJoinApiItem
}
