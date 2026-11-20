'use client'

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

// Arma el enlace "Ver en reportes" (botón ↗ de cada gráfico) con el MISMO periodo y moneda
// que el usuario está viendo en el dashboard, para que el reporte abra con esos filtros.
export function useReportHref(tab: ReportTabLink, vista?: 'recibidos' | 'saldos'): string {
  const filters = useDashboardFiltersStore((s) => s.filters)

  const params = new URLSearchParams({ tab })
  if (vista) params.set('vista', vista)
  params.set('preset', filters.preset)
  params.set('date_from', filters.dateFrom)
  params.set('date_to', filters.dateTo)
  params.set('currency', filters.currency)

  return `/reports?${params.toString()}`
}
