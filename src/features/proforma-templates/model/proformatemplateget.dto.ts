import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { ProformaTemplateApiItem, ProformaTemplateJoinApiItem } from './proformatemplate-api-item.dto'

export type { ProformaTemplateApiItem, ProformaTemplateJoinApiItem }

export type ProformaTemplateListRequestDto = {
  search?: string
  status?: number
  module?: string
  module_type_id?: number
  per_page?: number
  page?: number
}

export type ProformaTemplateListResponseDto = {
  success: boolean
  status: number
  message: string
  data: ProformaTemplateApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}

export type ProformaTemplateJoinListResponseDto = {
  success: boolean
  status: number
  message: string
  data: ProformaTemplateJoinApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}

export type ProformaTemplateGetByIdResponseDto = {
  success: boolean
  status: number
  message: string
  data: ProformaTemplateJoinApiItem
}
