import type { RoleType } from './role.type'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'

export type RoleGetResponseDto = {
  success: boolean
  status: number
  message: string
  data: RoleType[]
  links: LinksPaginationType
  meta: MetaPaginationType
}
