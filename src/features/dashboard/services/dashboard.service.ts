import apiClient from '@/shared/api/apiClient'
import { DASHBOARD_ENDPOINTS } from './dashboard.endpoint'
import { normalizeAmounts } from '../lib/normalize-amounts'
import type { DashboardApiResponse, DashboardRequestDto } from '../model/dashboard-common.dto'
import type { DashboardSummaryDto } from '../model/dashboard-summary.dto'
import type { DashboardSalesPerformanceDto } from '../model/dashboard-sales-performance.dto'
import type { DashboardProformasDto } from '../model/dashboard-proformas.dto'
import type { DashboardMessagesDto } from '../model/dashboard-messages.dto'
import type { DashboardStaffAccessDto } from '../model/dashboard-staff-access.dto'

// GET genérico: todos los dashboards reciben los mismos filtros y devuelven ApiResponse<T>.
async function getDashboard<T>(url: string, params: DashboardRequestDto): Promise<DashboardApiResponse<T>> {
  const { data } = await apiClient.get<DashboardApiResponse<T>>(url, { params })
  return { ...data, data: normalizeAmounts(data.data) }
}

export const dashboardService = {
  getSummary: (params: DashboardRequestDto) =>
    getDashboard<DashboardSummaryDto>(DASHBOARD_ENDPOINTS.v1.summary, params),

  getSalesPerformance: (params: DashboardRequestDto) =>
    getDashboard<DashboardSalesPerformanceDto>(DASHBOARD_ENDPOINTS.v1.salesPerformance, params),

  getProformas: (params: DashboardRequestDto) =>
    getDashboard<DashboardProformasDto>(DASHBOARD_ENDPOINTS.v1.proformas, params),

  getMessages: (params: DashboardRequestDto) =>
    getDashboard<DashboardMessagesDto>(DASHBOARD_ENDPOINTS.v1.messages, params),

  getStaffAccess: (params: DashboardRequestDto) =>
    getDashboard<DashboardStaffAccessDto>(DASHBOARD_ENDPOINTS.v1.staffAccess, params),
}
