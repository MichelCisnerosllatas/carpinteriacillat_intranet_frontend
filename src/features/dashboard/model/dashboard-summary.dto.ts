import type { DashboardPeriodDto } from './dashboard-common.dto'

// GET /v1/intranet/dashboard/summary — contrato §7.1 (Resumen general)

export type SalePaymentStatusDto = 'PENDIENTE' | 'PARCIAL' | 'PAGADO'

export type SummaryKpisDto = {
  sales_total: number
  sales_count: number
  sales_previous_total: number
  sales_growth_pct: number | null
  collected_total: number
  receivable_total: number
  average_ticket: number
  proformas_pending_count: number
  proformas_pending_total: number
  contact_messages_new_count: number
  chatbot_open_count: number
  goal_amount: number | null
  goal_progress_pct: number | null
}

export type SummaryMonthlyDto = {
  month: string // "2025-12"
  label: string // "Dic 2025"
  sales_total: number
  collected_total: number
}

export type SummaryPaymentStatusDto = {
  status: SalePaymentStatusDto
  label: string
  count: number
  total: number
}

export type SummaryLatestSaleDto = {
  id: number
  code: string
  client_name: string
  issue_date: string
  total: number
  balance: number
  status: string // GUARDADA | EMITIDA | ANULADA
  payment_status: SalePaymentStatusDto
}

export type SummaryTopDebtorDto = {
  client_id: number | null
  client_name: string
  balance: number
  sales_count: number
}

export type DashboardSummaryDto = {
  period: DashboardPeriodDto
  kpis: SummaryKpisDto
  monthly: SummaryMonthlyDto[]
  payment_status: SummaryPaymentStatusDto[]
  latest_sales: SummaryLatestSaleDto[]
  top_debtors: SummaryTopDebtorDto[]
}
