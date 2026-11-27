'use client'

import { useCan } from '@/features/auth/hooks/usePermission'
import { useDashboardFiltersStore } from '../stores/useDashboardFiltersStore'

// Pestañas de /reports (deben coincidir con REPORT_TABS de features/reports).
// Se repiten aquí como texto para no acoplar el dashboard a otra feature.
export type ReportTabLink =
  | 'ventas'
  | 'clientes'
  | 'productos'
  | 'pagos'
  | 'proformas'
  | 'mensajes'
  | 'vendedores'

// Permiso del reporte que abre cada pestaña (ver ROLES_Y_PERMISOS.md).
// En "pagos" depende de la vista: recibidos → report_payments, saldos → report_receivables.
function getReportPermission(tab: ReportTabLink, vista?: 'recibidos' | 'saldos'): string {
  switch (tab) {
    case 'ventas':
      return 'report_sales_register.view'
    case 'clientes':
      return 'report_sales_by_client.view'
    case 'productos':
      return 'report_sales_by_product.view'
    case 'pagos':
      return vista === 'saldos' ? 'report_receivables.view' : 'report_payments.view'
    case 'proformas':
      return 'report_proformas.view'
    case 'mensajes':
      return 'report_contact_messages.view'
    case 'vendedores':
      return 'report_sales_by_seller.view'
  }
}

// Arma el enlace "Ver en reportes" (botón ↗ de cada gráfico) con el MISMO periodo, moneda y
// vendedor que el usuario está viendo en el dashboard, para que el reporte abra con esos filtros.
// Devuelve undefined si el usuario no puede ver ese reporte: así <ChartCard> no pinta el botón ↗.
export function useReportHref(tab: ReportTabLink, vista?: 'recibidos' | 'saldos'): string | undefined {
  const filters = useDashboardFiltersStore((s) => s.filters)
  const sellerId = useDashboardFiltersStore((s) => s.sellerId)
  const branchIds = useDashboardFiltersStore((s) => s.branchIds)
  // Necesita la pantalla de reportes y además el reporte destino.
  const canOpenReports = useCan('reports.view')
  const canSeeReport = useCan(getReportPermission(tab, vista))

  if (!canOpenReports || !canSeeReport) return undefined

  const params = new URLSearchParams({ tab })
  if (vista) params.set('vista', vista)
  params.set('preset', filters.preset)
  params.set('date_from', filters.dateFrom)
  params.set('date_to', filters.dateTo)
  params.set('currency', filters.currency)
  if (sellerId) params.set('user_id', String(sellerId))
  // Sucursales como lista separada por comas (la pantalla de reportes la vuelve a separar).
  if (branchIds.length) params.set('branch_ids', branchIds.join(','))

  return `/reports?${params.toString()}`
}
