import { createDashboardStore } from './createDashboardStore'
import { dashboardService } from '../services/dashboard.service'
import type { DashboardSummaryDto } from '../model/dashboard-summary.dto'
import type { DashboardSalesPerformanceDto } from '../model/dashboard-sales-performance.dto'
import type { DashboardProformasDto } from '../model/dashboard-proformas.dto'
import type { DashboardMessagesDto } from '../model/dashboard-messages.dto'
import type { DashboardStaffAccessDto } from '../model/dashboard-staff-access.dto'

// Un store por módulo: cada página guarda su propia data (al volver a una página ya visitada se
// ve la data anterior al instante mientras se refresca en segundo plano).
export const useSummaryDashboardStore = createDashboardStore<DashboardSummaryDto>(dashboardService.getSummary)

export const useSalesPerformanceDashboardStore = createDashboardStore<DashboardSalesPerformanceDto>(
  dashboardService.getSalesPerformance
)

export const useProformasDashboardStore = createDashboardStore<DashboardProformasDto>(dashboardService.getProformas)

export const useMessagesDashboardStore = createDashboardStore<DashboardMessagesDto>(dashboardService.getMessages)

export const useStaffAccessDashboardStore = createDashboardStore<DashboardStaffAccessDto>(
  dashboardService.getStaffAccess
)
