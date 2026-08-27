import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { ProformaNoteApiItem } from './proformanote-api-item.dto'

export type { ProformaNoteApiItem }

export type ProformaNoteListRequestDto = {
  search?: string
  proforma_id?: number
  per_page?: number
  page?: number
}

export type ProformaNoteListResponseDto = {
  success: boolean
  status: number
  message: string
  data: ProformaNoteApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}
