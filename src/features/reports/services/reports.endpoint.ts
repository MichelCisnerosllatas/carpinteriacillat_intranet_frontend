import type { ReportKey } from '../model/report.dto'

export const REPORTS_ENDPOINTS = {
  v1: {
    get: (report: ReportKey) => `/v1/intranet/reports/${report}`,
    detail: (report: ReportKey, id: number) => `/v1/intranet/reports/${report}/detail/${id}`,
  },
}
