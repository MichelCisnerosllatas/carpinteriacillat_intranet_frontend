import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'

export type CompanyBranchApiItem = {
  id: number
  name: string
  address: string
  schedule: string | null
  latitude: number | null
  longitude: number | null
  status: number
  created_at: string
  updated_at: string | null
}

export type CompanyBranchListRequestDto = {
  search?: string
  status?: number
  per_page?: number
  page?: number
}

export type CompanyBranchListResponseDto = {
  success: boolean
  status: number
  message: string
  data: CompanyBranchApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}
