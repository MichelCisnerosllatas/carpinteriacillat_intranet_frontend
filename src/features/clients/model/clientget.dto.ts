import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { ClientApiItem, ClientJoinApiItem } from './client-api-item.dto'

export type { ClientApiItem, ClientJoinApiItem }

export type ClientListRequestDto = {
  search?: string
  id_typedoc?: number
  status?: number
  per_page?: number
  page?: number
}

export type ClientListResponseDto = {
  success: boolean
  status: number
  message: string
  data: ClientApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}

export type ClientJoinListResponseDto = {
  success: boolean
  status: number
  message: string
  data: ClientJoinApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}

export type ClientGetByIdResponseDto = {
  success: boolean
  status: number
  message: string
  data: ClientJoinApiItem
}
