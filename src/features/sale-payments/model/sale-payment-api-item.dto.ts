// src/features/sale-payments/model/sale-payment-api-item.dto.ts

export type SalePaymentApiItem = {
  id: number
  sale_id: number
  amount: number
  payment_date: string
  payment_method: string | null
  observation: string | null
  created_at: string
  updated_at: string | null
}
