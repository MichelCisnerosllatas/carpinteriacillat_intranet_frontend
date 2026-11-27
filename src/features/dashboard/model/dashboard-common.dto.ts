import type { Currency } from '@/shared/ui/dashboard'

// Parámetros comunes de los 5 endpoints de dashboard (contrato §7 + §11).
export type DashboardRequestDto = {
  date_from: string // Y-m-d
  date_to: string // Y-m-d
  currency: Currency
  /**
   * Vendedor (§11). Solo lo respeta el backend si el usuario tiene `sales.view_all`;
   * sin ese permiso el backend fuerza el usuario autenticado. Ausente = todos.
   */
  user_id?: number | null
  /** Sucursales (múltiple). Sin `company_branches.view_all` el backend recorta a las propias. */
  branch_ids?: number[]
}

export type DashboardPeriodDto = {
  date_from: string
  date_to: string
  currency: Currency
  /** Vendedor con el que se calculó la respuesta (null = todos). */
  user_id?: number | null
  seller_name?: string | null
  /** Sucursales con las que se calculó la respuesta (null = todas) y sus nombres. */
  branch_ids?: number[] | null
  branch_names?: string | null
}

// Respuesta estándar ApiResponse del backend.
export type DashboardApiResponse<T> = {
  success: boolean
  status: number
  message: string
  data: T
}

// NOTA sobre montos: el backend puede mandarlos como número o como string decimal ("120.50").
// dashboard.service.ts los convierte a number (normalizeAmounts) ANTES de guardarlos en el store,
// por eso en los DTO se tipan directamente como `number`.
