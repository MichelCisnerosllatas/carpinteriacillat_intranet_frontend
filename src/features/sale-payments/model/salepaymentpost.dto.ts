import type { SalePaymentApiItem } from './sale-payment-api-item.dto'

// El monto NO puede superar el `balance` (saldo pendiente) de la venta — validado en el
// servidor, ver «El monto del pago no puede superar el saldo pendiente de la venta» en
// sale-payments.md. El error 422 llega en `errors.amount`.
export type SalePaymentPostRequestDto = {
  sale_id: number
  amount: number
  payment_date: string
  payment_method?: string
  observation?: string
}

export type SalePaymentPostResponseDto = {
  success: boolean
  status: number
  message: string
  data: SalePaymentApiItem
  errors?: Record<string, string[]>
}
