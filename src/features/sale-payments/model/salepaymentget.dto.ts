import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { SalePaymentApiItem } from './sale-payment-api-item.dto'

export type { SalePaymentApiItem }

// Sin `search` — a diferencia de otros listados de venta, /sale-payments no lo admite (ver
// sale-payments.md).
export type SalePaymentListRequestDto = {
  sale_id?: number
  per_page?: number
  page?: number
}

export type SalePaymentListResponseDto = {
  success: boolean
  status: number
  message: string
  data: SalePaymentApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}
