// src/features/sale-goals/model/salegoal.dto.ts

// Meta mensual de ventas tal como la devuelve el backend (contrato §5). `amount` puede venir
// como string decimal ("15000.00").
export type SaleGoalApiItem = {
  id: number
  year: number
  month: number
  month_label: string
  currency: string
  amount: number | string
}

export type SaleGoalListRequestDto = {
  year: number
  currency: string
}

// Solo vienen los meses que tienen meta; los demás se muestran vacíos.
export type SaleGoalListResponseDto = {
  success: boolean
  status: number
  message: string
  data: SaleGoalApiItem[]
}

// PUT /sale-goals — upsert de todo el año. amount 0 o null = borrar la meta de ese mes.
export type SaleGoalPutRequestDto = {
  year: number
  currency: string
  goals: { month: number; amount: number | null }[]
}

export type SaleGoalPutResponseDto = SaleGoalListResponseDto & {
  errors?: Record<string, string[]>
}
