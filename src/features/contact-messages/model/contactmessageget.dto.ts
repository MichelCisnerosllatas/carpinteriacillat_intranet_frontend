import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'

export type ContactMessageApiItem = {
  id: number
  name: string
  email: string
  phone: string | null
  project_type: string | null
  message: string
  status: 'nuevo' | 'atendido' | 'descartado'
  ip_address: string | null
  created_at: string
  created_at_formatted: string
  updated_at: string
  updated_at_formatted: string
}

export type ContactMessageListRequestDto = {
  search?: string
  status?: string
  project_type?: string
  date_from?: string
  date_to?: string
  per_page?: number
  page?: number
}

export type ContactMessageListResponseDto = {
  success: boolean
  status: number
  message: string
  data: ContactMessageApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}

export type ContactMessageDetailResponseDto = {
  success: boolean
  status: number
  message: string
  data: ContactMessageApiItem
}
