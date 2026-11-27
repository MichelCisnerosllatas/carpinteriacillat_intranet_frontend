import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'

export type GoogleAccessRequestStatus = 'pending' | 'approved' | 'rejected'

export type GoogleAccessRequestApiItem = {
  id: number
  name: string | null
  email: string
  photo_url: string | null
  provider_uid: string | null
  provider: string
  email_verified: boolean
  status: GoogleAccessRequestStatus
  attempts: number
  last_attempt_at: string | null
  last_attempt_at_formatted: string | null
  reviewed_at: string | null
  reviewed_at_formatted: string | null
  reviewer?: { id: number; email: string } | null
  id_user: number | null
  created_at: string
  created_at_formatted: string
}

export type GoogleAccessRequestListRequestDto = {
  search?: string
  status?: GoogleAccessRequestStatus
  per_page?: number
  page?: number
}

export type GoogleAccessRequestListResponseDto = {
  success: boolean
  status: number
  message: string
  data: GoogleAccessRequestApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}

export type GoogleAccessRequestDetailResponseDto = {
  success: boolean
  status: number
  message: string
  data: GoogleAccessRequestApiItem
}
