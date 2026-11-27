import type { ReportKey } from '../model/report.dto'

// Bloques de cada reporte que se controlan por permiso (ver ROLES_Y_PERMISOS.md).
export type ReportBlock = 'view' | 'kpis' | 'charts' | 'table' | 'detail' | 'export'

// Permiso de un bloque del reporte: ('sales-register', 'export') → 'report_sales_register.export'
export function reportPermission(report: ReportKey, block: ReportBlock): string {
  return `report_${report.replace(/-/g, '_')}.${block}`
}
