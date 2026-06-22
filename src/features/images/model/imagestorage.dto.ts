import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'

export type StorageFileItem = {
  path: string
  url: string
  last_modified?: number
}

export type StorageListRequestDto = {
  folder?: string
  per_page?: number
  page?: number
}

export type StorageListResponseDto = {
  success: boolean
  message: string
  data: StorageFileItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}

export type StorageDeleteResponseDto = {
  success: boolean
  status: number
  message: string
  data: null
}
