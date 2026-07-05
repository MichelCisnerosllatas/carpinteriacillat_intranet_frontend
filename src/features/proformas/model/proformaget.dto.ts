import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { ProformaApiItem, ProformaJoinApiItem, ProformaStatusApi } from './proforma-api-item.dto'

export type { ProformaApiItem, ProformaJoinApiItem, ProformaStatusApi }

export type ProformaListRequestDto = {
  search?: string
  status?: ProformaStatusApi
  client_id?: number
  date_from?: string
  date_to?: string
  per_page?: number
  page?: number
}

export type ProformaListResponseDto = {
  success: boolean
  status: number
  message: string
  data: ProformaApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}

export type ProformaJoinListResponseDto = {
  success: boolean
  status: number
  message: string
  data: ProformaJoinApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}

export type ProformaGetByIdResponseDto = {
  success: boolean
  status: number
  message: string
  data: ProformaJoinApiItem
}
