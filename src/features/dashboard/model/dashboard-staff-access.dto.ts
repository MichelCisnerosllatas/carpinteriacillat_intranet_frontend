import type { DashboardPeriodDto } from './dashboard-common.dto'

// GET /v1/intranet/dashboard/staff-access — contrato §7.5 (Accesos del personal)

export type StaffAccessKpisDto = {
  logins_total: number
  active_devices: number
  users_with_login: number
}

export type StaffDailyLoginsDto = { date: string; label: string; logins: number }
export type StaffByPlatformDto = { platform: string; label: string; count: number }
export type StaffByAppVersionDto = { version: string; count: number }
export type StaffByBrowserDto = { browser: string; count: number }
export type GoogleRequestsByStatusDto = { status: string; label: string; count: number }

export type DashboardStaffAccessDto = {
  period: DashboardPeriodDto
  // Bloques (widgets) opcionales: el backend OMITE los que el rol no tiene permitidos.
  kpis?: StaffAccessKpisDto
  daily?: StaffDailyLoginsDto[]
  by_platform?: StaffByPlatformDto[]
  by_app_version?: StaffByAppVersionDto[]
  by_browser?: StaffByBrowserDto[]
  google_requests_by_status?: GoogleRequestsByStatusDto[]
}
