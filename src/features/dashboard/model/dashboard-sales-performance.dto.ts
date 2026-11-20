import type { DashboardPeriodDto } from './dashboard-common.dto'

// GET /v1/intranet/dashboard/sales-performance — contrato §7.2 (Rendimiento de ventas)

export type SalesPerformanceKpisDto = {
  sales_total: number
  sales_count: number
  average_ticket: number
  discount_total: number
  tax_total: number
  cancelled_count: number
  cancelled_total: number
  growth_vs_previous_pct: number | null
  growth_vs_last_year_pct: number | null
}

export type SalesGoalDto = {
  year: number
  month: number
  month_label: string // "Noviembre 2026"
  amount: number | null // null = no hay meta registrada para ese mes
  achieved: number
  progress_pct: number | null
  remaining: number | null
}

export type SalesMonthlyDto = {
  month: string
  label: string
  total: number
  count: number
  goal: number | null
}

export type SalesByDocumentTypeDto = { name: string; code: string; count: number; total: number }
export type SalesByPaymentMethodDto = { method: string; label: string; count: number; total: number }
export type SalesTopClientDto = { client_id: number | null; client_name: string; count: number; total: number }

export type SalesTopProductDto = {
  product_service_id: number | null
  name: string
  type: 'product' | 'service' | 'other' | string
  quantity: number
  total: number
}

export type SalesByTypeDto = { type: 'product' | 'service' | 'other'; label: string; total: number }
export type SalesByCategoryDto = { category: string; total: number }

export type SalesWeekdayHeatmapDto = {
  weekday: number // 1 = Lunes … 7 = Domingo
  weekday_label: string
  month: string
  month_label: string
  count: number
  total: number
}

export type ReceivableAgingDto = {
  bucket: '0-30' | '31-60' | '61-90' | '90+'
  label: string
  count: number
  total: number
}

export type ReceivableClientDto = {
  client_id: number | null
  client_name: string
  balance: number
  sales_count: number
  oldest_issue_date: string
  days: number
}

export type SalesReceivablesDto = {
  total: number
  aging: ReceivableAgingDto[]
  clients: ReceivableClientDto[]
}

export type DashboardSalesPerformanceDto = {
  period: DashboardPeriodDto
  kpis: SalesPerformanceKpisDto
  goal: SalesGoalDto
  monthly: SalesMonthlyDto[]
  by_document_type: SalesByDocumentTypeDto[]
  by_payment_method: SalesByPaymentMethodDto[]
  top_clients: SalesTopClientDto[]
  top_products: SalesTopProductDto[]
  by_type: SalesByTypeDto[]
  by_category: SalesByCategoryDto[]
  weekday_heatmap: SalesWeekdayHeatmapDto[]
  receivables: SalesReceivablesDto
}
