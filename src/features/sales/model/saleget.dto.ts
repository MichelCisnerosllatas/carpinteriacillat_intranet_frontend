import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type {
  SaleApiItem,
  SaleJoinApiItem,
  SaleStatusApi,
  SalePaymentStatusApi,
} from './sale-api-item.dto'

export type { SaleApiItem, SaleJoinApiItem, SaleStatusApi, SalePaymentStatusApi }

export type SaleListRequestDto = {
  search?: string
  status?: SaleStatusApi
  payment_status?: SalePaymentStatusApi
  client_id?: number
  /** Filtrar por vendedor — el backend solo lo respeta con `sales.view_all`. */
  user_id?: number
  /** Sucursales (múltiple). El backend recorta a las que el usuario puede ver. */
  branch_ids?: number[]
  date_from?: string
  date_to?: string
  per_page?: number
  page?: number
}

export type SaleListResponseDto = {
  success: boolean
  status: number
  message: string
  data: SaleApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}

export type SaleJoinListResponseDto = {
  success: boolean
  status: number
  message: string
  data: SaleJoinApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}

export type SaleGetByIdResponseDto = {
  success: boolean
  status: number
  message: string
  data: SaleJoinApiItem
}
