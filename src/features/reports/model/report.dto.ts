import type { Currency } from '@/shared/ui/dashboard'

// Contrato §8 + §10 (Reportes v2) — GET /v1/intranet/reports/{report}
//                                     GET /v1/intranet/reports/{report}/detail/{id}

export type ReportKey =
  | 'sales-register'
  | 'sales-by-client'
  | 'sales-by-product'
  | 'receivables'
  | 'payments'
  | 'proformas'
  | 'contact-messages'
  | 'sales-by-seller'

export type ReportFormat = 'json' | 'xlsx' | 'pdf'

/** Tipo de dato de una columna / KPI / campo: decide cómo se formatea en pantalla. */
export type ReportValueType = 'text' | 'money' | 'number' | 'date' | 'percent'
/** Alias que se mantiene por compatibilidad con el nombre anterior. */
export type ReportColumnType = ReportValueType

export type ReportRequestDto = {
  date_from: string
  date_to: string
  currency: Currency
  client_id?: number | null
  status?: string | null
  /** Vendedor (§11). Solo lo respeta el backend con `sales.view_all`; sin el permiso usa el propio. */
  user_id?: number | null
  /** Sucursales (múltiple). Sin `company_branches.view_all` el backend recorta a las propias. */
  branch_ids?: number[] | null
  format?: ReportFormat
}

export type ReportColumnDto = {
  key: string
  label: string
  type: ReportValueType
}

export type ReportKpiDto = {
  key: string
  label: string
  value: number | string | null
  type: ReportValueType
}

export type ReportChartType = 'line' | 'bar' | 'bar_horizontal' | 'donut' | 'funnel'

export type ReportChartSeriesDto = {
  key: string
  label: string
  type: ReportValueType
}

export type ReportChartDto = {
  key: string
  title: string
  subtitle?: string | null
  type: ReportChartType
  /** Campo de cada fila de `data` que se usa como eje X / nombre de la categoría. */
  x_key: string
  series: ReportChartSeriesDto[]
  /** Vacío ([]) cuando no hay datos: en ese caso el gráfico NO se pinta. */
  data: Record<string, string | number | null>[]
}

/** A qué módulo pertenece la fila, para el botón "Ver" (👁). */
export type ReportLinkType = 'sale' | 'proforma' | 'contact_message' | 'client' | 'user'

export type ReportRowLinkDto = { type: ReportLinkType; id: number } | null

// Cada fila es un objeto { [column.key]: valor } más `id` (para el detalle) y `link`.
// Los montos pueden venir como number o string.
export type ReportRowDto = {
  /** 0 = "Cliente varios" o "Ítems libres". */
  id?: number
  link?: ReportRowLinkDto
  [columnKey: string]: string | number | null | ReportRowLinkDto | undefined
}

export type ReportDataDto = {
  report: ReportKey
  title: string
  filters: { date_from: string; date_to: string; currency: Currency } & Record<string, unknown>
  kpis: ReportKpiDto[]
  charts: ReportChartDto[]
  columns: ReportColumnDto[]
  rows: ReportRowDto[]
  // Solo trae las columnas money/number que tiene sentido sumar.
  // null si el rol no tiene report_<slug>.table (también llegan columns/rows vacíos).
  totals: Record<string, number | string> | null
  /** true = cada fila se puede expandir para ver su detalle (false sin report_<slug>.detail). */
  has_detail: boolean
}

export type ReportResponseDto = {
  success: boolean
  status: number
  message: string
  data: ReportDataDto
}

// ── Detalle de una fila (§10.2) ──

export type ReportDetailFieldDto = {
  label: string
  value: string | number | null
  type: ReportValueType
}

export type ReportDetailSectionDto = {
  title: string
  columns: ReportColumnDto[]
  rows: Record<string, string | number | null>[]
  totals?: Record<string, number | string>
}

export type ReportDetailDto = {
  title: string
  subtitle?: string | null
  fields: ReportDetailFieldDto[]
  sections: ReportDetailSectionDto[]
}

export type ReportDetailResponseDto = {
  success: boolean
  status: number
  message: string
  data: ReportDetailDto
}
