import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'

export type ProformaTypeApiItem = {
  id: number
  name: string
  code: string | null
  status: number
  created_at: string
  updated_at: string | null
}

export type ProformaTypeListRequestDto = {
  search?: string
  status?: number
  per_page?: number
  page?: number
}

export type ProformaTypeListResponseDto = {
  success: boolean
  status: number
  message: string
  data: ProformaTypeApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}
