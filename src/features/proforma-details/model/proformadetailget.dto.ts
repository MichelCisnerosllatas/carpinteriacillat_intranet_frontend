import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { ProformaDetailApiItem } from './proformadetail-api-item.dto'

export type { ProformaDetailApiItem }

export type ProformaDetailListRequestDto = {
  search?: string
  proforma_id?: number
  per_page?: number
  page?: number
}

export type ProformaDetailListResponseDto = {
  success: boolean
  status: number
  message: string
  data: ProformaDetailApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}
