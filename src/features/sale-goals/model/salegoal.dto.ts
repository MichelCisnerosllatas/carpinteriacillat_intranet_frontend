// src/features/sale-goals/model/salegoal.dto.ts

// Meta mensual de ventas tal como la devuelve el backend (contrato §5 y §11). `amount` puede
// venir como string decimal ("15000.00").
export type SaleGoalApiItem = {
  id: number
  year: number
  month: number
  month_label: string
  currency: string
  amount: number | string
  /** null = meta general del negocio; con id = meta de ese vendedor. */
  user_id: number | null
  seller_name: string | null
}

export type SaleGoalListRequestDto = {
  year: number
  currency: string
  /** Ausente = solo metas generales; 'all' = generales + por vendedor; número = ese vendedor. */
  user_id?: number | 'all'
}

// Solo vienen los meses que tienen meta; los demás se muestran vacíos.
export type SaleGoalListResponseDto = {
  success: boolean
  status: number
  message: string
  data: SaleGoalApiItem[]
}

// PUT /sale-goals — upsert del año de UNA meta (general o de un vendedor).
// amount 0 o null = borrar la meta de ese mes.
export type SaleGoalPutRequestDto = {
  year: number
  currency: string
  user_id: number | null
  goals: { month: number; amount: number | null }[]
}

export type SaleGoalPutResponseDto = SaleGoalListResponseDto & {
  errors?: Record<string, string[]>
}
