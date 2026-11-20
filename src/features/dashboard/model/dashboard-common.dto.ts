import type { Currency } from '@/shared/ui/dashboard'

// Parámetros comunes de los 5 endpoints de dashboard (contrato §7).
export type DashboardRequestDto = {
  date_from: string // Y-m-d
  date_to: string // Y-m-d
  currency: Currency
}

export type DashboardPeriodDto = {
  date_from: string
  date_to: string
  currency: Currency
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
