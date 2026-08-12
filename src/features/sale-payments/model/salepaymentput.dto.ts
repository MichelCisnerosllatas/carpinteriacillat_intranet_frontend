import type { SalePaymentApiItem } from './sale-payment-api-item.dto'

// Al editar, el servidor valida que la suma de TODOS los demás pagos de la venta + este nuevo
// monto no supere el `total` de la venta (no contra `balance`, que ya incluye el monto actual de
// este mismo pago antes de la edición) — ver sale-payments.md.
export type SalePaymentPutRequestDto = {
  amount: number
  payment_date: string
  payment_method?: string
  observation?: string
}

export type SalePaymentPutResponseDto = {
  success: boolean
  status: number
  message: string
  data: SalePaymentApiItem
  errors?: Record<string, string[]>
}
