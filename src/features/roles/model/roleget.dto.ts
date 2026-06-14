import type { RoleType } from '@/entities/role/model/role.type'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'

export type RoleListRequestDto = {
  search?: string
  state?: number
  date_from?: string
  date_to?: string
  per_page?: number
  page?: number
}

export type RoleListResponseDto = {
  success: boolean
  status: number
  message: string
  data: RoleType[]
  links: LinksPaginationType
  meta: MetaPaginationType
}
