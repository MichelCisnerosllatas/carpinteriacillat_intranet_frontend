import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'

export type CompanyBankAccountApiItem = {
  id: number
  bank: string
  account_number: string
  account_type: string | null
  currency: string
  logo: string | null
  order: number
  status: number
  created_at: string
  updated_at: string | null
}

export type CompanyBankAccountListRequestDto = {
  search?: string
  status?: number
  currency?: string
  per_page?: number
  page?: number
}

export type CompanyBankAccountListResponseDto = {
  success: boolean
  status: number
  message: string
  data: CompanyBankAccountApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}
