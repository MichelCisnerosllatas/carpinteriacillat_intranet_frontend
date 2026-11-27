import type { DashboardPeriodDto } from './dashboard-common.dto'
import type { SalesGoalDto } from './dashboard-sales-performance.dto'

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
  // goal_* solo llegan con el widget dashboard_summary.goal
  goal_amount?: number | null
  goal_progress_pct?: number | null
  /** §11: vendedores con al menos una venta en el periodo. */
  sellers_active?: number
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
  // Bloques (widgets) opcionales: el backend OMITE los que el rol no tiene permitidos.
  kpis?: SummaryKpisDto
  // Meta del mes (widget dashboard_summary.goal). Viene aunque el rol no tenga 'kpis'.
  goal?: SalesGoalDto
  monthly?: SummaryMonthlyDto[]
  payment_status?: SummaryPaymentStatusDto[]
  latest_sales?: SummaryLatestSaleDto[]
  top_debtors?: SummaryTopDebtorDto[]
}
