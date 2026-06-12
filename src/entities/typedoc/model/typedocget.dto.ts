import type { TypeDocType } from './typedoc.type'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'

export type TypeDocGetResponseDto = {
  success: boolean
  status: number
  message: string
  data: TypeDocType[]
  links: LinksPaginationType
  meta: MetaPaginationType
}
