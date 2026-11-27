'use client'

import { useEffect, useRef } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { DATE_RANGE_PRESETS, isValidRange, type Currency, type DateRangePreset } from '@/shared/ui/dashboard'
import {
  PAYMENTS_VIEWS,
  REPORT_TABS,
  isPaymentsView,
  isReportTab,
  type PaymentsView,
  type ReportTab,
} from '../data/reports.config'
import type { ReportKey } from '../model/report.dto'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { hasPermission } from '@/features/auth/hooks/usePermission'
import { reportPermission } from '../lib/report-permission'
import { useReportDetailStore } from '../stores/useReportDetailStore'
import { selectActiveReport, useReportStore } from '../stores/useReportStore'
import { PaymentsViewToggle } from './payments-view-toggle'
import { ReportMessage } from './report-message'
import { ReportPanel } from './report-panel'

/** Parámetros de la URL (?tab=ventas&date_from=...): llegan desde la página o desde el dashboard. */
export type ReportsQuery = {
  tab?: string
  vista?: string
  preset?: string
  date_from?: string
  date_to?: string
  currency?: string
  /** Vendedor (solo se aplica si el usuario tiene `sales.view_all`). */
  user_id?: string
  /** Sucursales separadas por coma (las manda el dashboard). El backend recorta a las permitidas. */
  branch_ids?: string
}

// Espera tras el último cambio de filtro antes de consultar (evita una petición por tecla).
const DEBOUNCE_MS = 400

const isDate = (value?: string) => Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value))

// Escribe la pestaña en la URL sin recargar la página (así se puede compartir o volver atrás).
function writeTabToUrl(tab: ReportTab, view: PaymentsView) {
  const query = tab === 'pagos' ? `?tab=pagos&vista=${view}` : `?tab=${tab}`
  window.history.replaceState(null, '', `/reports${query}`)
}

// Página única de Reportes: pestañas por tema, filtros compartidos arriba, y en cada pestaña
// KPIs + gráficos + tabla con detalle por fila. Todo lo arma a partir de lo que manda el backend.
export function ReportsView({ query }: { query: ReportsQuery }) {
  const tab = useReportStore((s) => s.tab)
  const paymentsView = useReportStore((s) => s.paymentsView)
  const filters = useReportStore((s) => s.filters)
  const clientId = useReportStore((s) => s.clientId)
  const sellerId = useReportStore((s) => s.sellerId)
  const branchIds = useReportStore((s) => s.branchIds)
  const status = useReportStore((s) => s.status)
  const setTab = useReportStore((s) => s.setTab)
  const setPaymentsView = useReportStore((s) => s.setPaymentsView)
  const load = useReportStore((s) => s.load)
  const clearDetails = useReportDetailStore((s) => s.clear)

  // Solo se muestran los reportes que el usuario tiene permitidos: report_<slug>.view (ver ROLES_Y_PERMISOS.md).
  const session = useAuthStore((s) => s.session)
  const canSeeReport = (report: ReportKey) => hasPermission(session, reportPermission(report, 'view'))
  // Ver/filtrar ventas de todos los vendedores (§11).
  const canViewAll = hasPermission(session, 'sales.view_all')
  const allowedViews = PAYMENTS_VIEWS.filter((view) => canSeeReport(view.report))
  // La pestaña "Pagos" tiene dos vistas: se muestra si puede ver al menos una.
  const allowedTabs = REPORT_TABS.filter((item) =>
    item.value === 'pagos'
      ? allowedViews.length > 0
      : // Además del permiso del reporte, una pestaña puede pedir otro extra (campo permission, opcional).
        canSeeReport(item.report) && (!item.permission || hasPermission(session, item.permission))
  )
  const allowedTabsKey = allowedTabs.map((t) => t.value).join(',')
  const allowedViewsKey = allowedViews.map((v) => v.value).join(',')
  const isActiveAllowed =
    canSeeReport(selectActiveReport({ tab, paymentsView })) && allowedTabs.some((item) => item.value === tab)

  // 1) Al entrar: se aplican la pestaña y los filtros que vienen en la URL (una sola vez).
  const appliedQuery = useRef(false)
  useEffect(() => {
    if (appliedQuery.current) return
    appliedQuery.current = true

    const store = useReportStore.getState()
    store.setTab(isReportTab(query.tab) ? query.tab : 'ventas')
    if (isPaymentsView(query.vista)) store.setPaymentsView(query.vista)

    // Vendedor que manda el dashboard (botón ↗). Sin view_all se ignora: el backend usa el propio.
    const userId = Number(query.user_id)
    store.setSellerId(canViewAll && Number.isInteger(userId) && userId > 0 ? userId : null)

    // Sucursales que manda el dashboard ("1,2").
    const branchIds = (query.branch_ids ?? '')
      .split(',')
      .map((v) => Number(v))
      .filter((v) => Number.isInteger(v) && v > 0)
    store.setBranchIds(branchIds)

    // Periodo y moneda que manda el dashboard (botón "Ver en reportes").
    if (isDate(query.date_from) && isDate(query.date_to)) {
      const preset = DATE_RANGE_PRESETS.some((p) => p.value === query.preset)
        ? (query.preset as DateRangePreset)
        : 'custom'
      const currency: Currency = query.currency === 'USD' ? 'USD' : query.currency === 'PEN' ? 'PEN' : store.filters.currency
      store.setFilters({ preset, dateFrom: query.date_from!, dateTo: query.date_to!, currency })
    }
  }, [query, canViewAll])

  // 1.b) Si la pestaña (o la vista de pagos) elegida no está permitida, se pasa a la primera permitida.
  useEffect(() => {
    const store = useReportStore.getState()
    const tabs = allowedTabsKey ? (allowedTabsKey.split(',') as ReportTab[]) : []
    const views = allowedViewsKey ? (allowedViewsKey.split(',') as PaymentsView[]) : []
    if (tabs.length > 0 && !tabs.includes(store.tab)) store.setTab(tabs[0])
    if (views.length > 0 && !views.includes(store.paymentsView)) store.setPaymentsView(views[0])
  }, [allowedTabsKey, allowedViewsKey, tab, paymentsView])

  // 2) Cada vez que cambia la pestaña o un filtro, se vuelve a consultar (con una pequeña espera).
  useEffect(() => {
    if (!isValidRange(filters)) return
    // No se consulta un reporte sin permiso (el backend respondería 403).
    if (!isActiveAllowed) return
    const timer = window.setTimeout(() => {
      clearDetails()
      load()
    }, DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [tab, paymentsView, filters, clientId, sellerId, branchIds, status, load, clearDetails, isActiveAllowed])

  const handleTabChange = (value: string) => {
    if (!isReportTab(value)) return
    setTab(value)
    writeTabToUrl(value, paymentsView)
  }

  const handleViewChange = (view: PaymentsView) => {
    setPaymentsView(view)
    writeTabToUrl('pagos', view)
  }

  // Mientras carga la sesión no se muestra nada.
  if (!session) return null

  if (allowedTabs.length === 0) {
    return <ReportMessage text='No tienes reportes disponibles.' />
  }

  return (
    <Tabs value={tab} onValueChange={handleTabChange} className='gap-4'>
      {/* En el celular las pestañas no entran: se desplazan horizontalmente. */}
      <div className='-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0'>
        <TabsList className='w-max'>
          {allowedTabs.map((item) => (
            <TabsTrigger key={item.value} value={item.value} className='px-3'>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {/* Radix solo monta el contenido de la pestaña activa. */}
      {allowedTabs.map((item) => (
        <TabsContent key={item.value} value={item.value} className='flex min-w-0 flex-col gap-4'>
          {item.value === 'pagos' && (
            <PaymentsViewToggle views={allowedViews} value={paymentsView} onChange={handleViewChange} />
          )}
          <ReportPanel />
        </TabsContent>
      ))}
    </Tabs>
  )
}
