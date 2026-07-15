import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'

export type CompanySignatureApiItem = {
  id: number
  signer_name: string
  position: string | null
  phone: string | null
  signature_image: string | null
  status: number
  created_at: string
  updated_at: string | null
}

export type CompanySignatureListRequestDto = {
  search?: string
  status?: number
  per_page?: number
  page?: number
}

export type CompanySignatureListResponseDto = {
  success: boolean
  status: number
  message: string
  data: CompanySignatureApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}

export type CompanySignatureGetByIdResponseDto = {
  success: boolean
  status: number
  message: string
  data: CompanySignatureApiItem
}
