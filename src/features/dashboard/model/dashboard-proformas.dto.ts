import type { DashboardPeriodDto } from './dashboard-common.dto'

// GET /v1/intranet/dashboard/proformas — contrato §7.3 (Seguimiento de proformas)

export type ProformasKpisDto = {
  total_count: number
  quoted_total: number
  accepted_count: number
  converted_count: number
  accepted_rate_pct: number | null
  conversion_rate_pct: number | null
  sold_from_proformas_total: number
}

export type ProformasFunnelDto = {
  stage: 'CREADAS' | 'ACEPTADAS' | 'CONVERTIDAS'
  label: string
  count: number
  total: number
}

export type ProformasByStatusDto = { status: string; label: string; count: number; total: number }
export type ProformasByTypeDto = { name: string; count: number; total: number }

export type ProformasMonthlyDto = {
  month: string
  label: string
  quoted_total: number
  sold_total: number
}

export type ProformasTopClientDto = { client_name: string; count: number; total: number }

export type DashboardProformasDto = {
  period: DashboardPeriodDto
  kpis: ProformasKpisDto
  funnel: ProformasFunnelDto[]
  by_status: ProformasByStatusDto[]
  by_type: ProformasByTypeDto[]
  monthly: ProformasMonthlyDto[]
  top_clients: ProformasTopClientDto[]
}
