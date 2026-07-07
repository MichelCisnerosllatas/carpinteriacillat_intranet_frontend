import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'

export type CompanyContactType = 'phone' | 'mobile' | 'fax' | 'whatsapp'

export type CompanyContactApiItem = {
  id: number
  name: string | null
  phone: string
  type: CompanyContactType
  email: string | null
  is_primary: boolean
  show_on_website: boolean
  order: number
  status: number
  created_at: string
  updated_at: string | null
}

export type CompanyContactListRequestDto = {
  search?: string
  status?: number
  type?: CompanyContactType
  show_on_website?: number
  per_page?: number
  page?: number
}

export type CompanyContactListResponseDto = {
  success: boolean
  status: number
  message: string
  data: CompanyContactApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}
