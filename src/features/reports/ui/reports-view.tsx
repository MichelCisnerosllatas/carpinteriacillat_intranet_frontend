'use client'

import { useEffect, useRef } from 'react'
import { AlertCircle, FileSearch, Info, Loader2, RefreshCw } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { IconButton } from '@/shared/ui/icon-button'
import { Skeleton } from '@/shared/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import {
  DATE_RANGE_PRESETS,
  formatNumber,
  isValidRange,
  toNumber,
  type Currency,
  type DateRangePreset,
} from '@/shared/ui/dashboard'
import {
  PAYMENTS_VIEWS,
  REPORT_TABS,
  REPORTS,
  isPaymentsView,
  isReportTab,
  type PaymentsView,
  type ReportTab,
} from '../data/reports.config'
import { useReportDetailStore } from '../stores/useReportDetailStore'
import { buildReportParams, selectActiveReport, useReportStore } from '../stores/useReportStore'
import { ReportCharts } from './report-charts'
import { ReportExportButtons } from './report-export-buttons'
import { ReportFilters } from './report-filters'
import { ReportKpis } from './report-kpis'
import { ReportTable } from './report-table'

/** Parámetros de la URL (?tab=ventas&date_from=...): llegan desde la página o desde el dashboard. */
export type ReportsQuery = {
  tab?: string
  vista?: string
  preset?: string
  date_from?: string
  date_to?: string
  currency?: string
}

// Límite de filas que devuelve el backend (contrato §8). Si se llega, se avisa al usuario.
const MAX_ROWS = 5000
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
  const status = useReportStore((s) => s.status)
  const setTab = useReportStore((s) => s.setTab)
  const setPaymentsView = useReportStore((s) => s.setPaymentsView)
  const load = useReportStore((s) => s.load)
  const clearDetails = useReportDetailStore((s) => s.clear)

  // 1) Al entrar: se aplican la pestaña y los filtros que vienen en la URL (una sola vez).
  const appliedQuery = useRef(false)
  useEffect(() => {
    if (appliedQuery.current) return
    appliedQuery.current = true

    const store = useReportStore.getState()
    store.setTab(isReportTab(query.tab) ? query.tab : 'ventas')
    if (isPaymentsView(query.vista)) store.setPaymentsView(query.vista)

    // Periodo y moneda que manda el dashboard (botón "Ver en reportes").
    if (isDate(query.date_from) && isDate(query.date_to)) {
      const preset = DATE_RANGE_PRESETS.some((p) => p.value === query.preset)
        ? (query.preset as DateRangePreset)
        : 'custom'
      const currency: Currency = query.currency === 'USD' ? 'USD' : query.currency === 'PEN' ? 'PEN' : store.filters.currency
      store.setFilters({ preset, dateFrom: query.date_from!, dateTo: query.date_to!, currency })
    }
  }, [query])

  // 2) Cada vez que cambia la pestaña o un filtro, se vuelve a consultar (con una pequeña espera).
  useEffect(() => {
    if (!isValidRange(filters)) return
    const timer = window.setTimeout(() => {
      clearDetails()
      load()
    }, DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [tab, paymentsView, filters, clientId, status, load, clearDetails])

  const handleTabChange = (value: string) => {
    if (!isReportTab(value)) return
    setTab(value)
    writeTabToUrl(value, paymentsView)
  }

  const handleViewChange = (view: PaymentsView) => {
    setPaymentsView(view)
    writeTabToUrl('pagos', view)
  }

  return (
    <Tabs value={tab} onValueChange={handleTabChange} className='gap-4'>
      {/* En el celular las pestañas no entran: se desplazan horizontalmente. */}
      <div className='-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0'>
        <TabsList className='w-max'>
          {REPORT_TABS.map((item) => (
            <TabsTrigger key={item.value} value={item.value} className='px-3'>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {/* Radix solo monta el contenido de la pestaña activa. */}
      {REPORT_TABS.map((item) => (
        <TabsContent key={item.value} value={item.value} className='flex min-w-0 flex-col gap-4'>
          {item.value === 'pagos' && <PaymentsViewToggle value={paymentsView} onChange={handleViewChange} />}
          <ReportPanel />
        </TabsContent>
      ))}
    </Tabs>
  )
}

// Toggle "Pagos recibidos / Saldos pendientes" de la pestaña Pagos.
function PaymentsViewToggle({ value, onChange }: { value: PaymentsView; onChange: (view: PaymentsView) => void }) {
  return (
    <div role='group' aria-label='Tipo de reporte de pagos' className='bg-muted inline-flex w-fit rounded-lg p-0.5'>
      {PAYMENTS_VIEWS.map((view) => (
        <button
          key={view.value}
          type='button'
          aria-pressed={value === view.value}
          onClick={() => onChange(view.value)}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            value === view.value ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {view.label}
        </button>
      ))}
    </div>
  )
}

// Contenido de la pestaña activa: filtros, KPIs, gráficos y tabla.
function ReportPanel() {
  const state = useReportStore()
  const { filters, data, isFetching, isError, message, load } = state
  const report = selectActiveReport(state)
  const config = REPORTS[report]
  const rangeOk = isValidRange(filters)

  // Solo se muestra el resultado si corresponde al reporte activo (evita ver otro mientras carga).
  const result = data?.report === report ? data : null
  const currency = result?.filters.currency ?? filters.currency

  // "Todo vacío" = sin filas y sin gráficos con datos: se muestra un solo aviso compacto.
  const hasChartData = (result?.charts ?? []).some((chart) =>
    chart.data.some((row) => chart.series.some((s) => toNumber(row[s.key]) !== 0))
  )
  const isAllEmpty = result !== null && result.rows.length === 0 && !hasChartData

  return (
    <div className='flex min-w-0 flex-col gap-4'>
      <div>
        <h3 className='text-lg font-semibold'>{config.title}</h3>
        <p className='text-muted-foreground text-sm'>{config.description}</p>
      </div>

      <ReportFilters
        config={config}
        actions={
          <>
            <IconButton
              label='Actualizar'
              onClick={() => load()}
              disabled={isFetching || !rangeOk}
              icon={isFetching ? <Loader2 className='animate-spin' /> : <RefreshCw />}
            />
            <ReportExportButtons disabled={!rangeOk} />
          </>
        }
      />

      {config.note && (
        <p className='text-muted-foreground flex items-start gap-1.5 text-xs'>
          <Info className='mt-0.5 h-3.5 w-3.5 shrink-0' /> {config.note}
        </p>
      )}
      {!rangeOk && (
        <p className='text-destructive text-xs'>Revisa el rango: la fecha “Desde” debe ser anterior o igual a “Hasta”.</p>
      )}

      {isError && !isFetching ? (
        <ReportMessage error text={message ?? 'No se pudo generar el reporte.'} />
      ) : !result ? (
        rangeOk && <ReportSkeleton />
      ) : isAllEmpty ? (
        <ReportMessage text='No hay registros para los filtros seleccionados.' />
      ) : (
        // Mientras se recarga se deja ver el resultado anterior, un poco atenuado.
        <div className={cn('flex min-w-0 flex-col gap-4 transition-opacity', isFetching && 'opacity-60')}>
          <ReportKpis kpis={result.kpis} currency={currency} />
          <ReportCharts charts={result.charts} currency={currency} />

          {result.rows.length > 0 && (
            <>
              <p className='text-muted-foreground text-sm'>
                {formatNumber(result.rows.length)} registros
                {result.rows.length >= MAX_ROWS && ' (se muestran los primeros 5,000: acota el rango o exporta por partes)'}
              </p>
              {/* key: al cambiar el resultado se cierran las filas abiertas y vuelve a la primera página. */}
              <ReportTable
                key={`${report}-${result.filters.date_from}-${result.filters.date_to}-${result.rows.length}`}
                data={result}
                report={report}
                params={buildReportParams(state)}
                currency={currency}
              />
            </>
          )}
        </div>
      )}
    </div>
  )
}

function ReportSkeleton() {
  return (
    <div className='flex flex-col gap-4'>
      <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className='h-24 w-full rounded-xl' />
        ))}
      </div>
      <Skeleton className='h-64 w-full rounded-xl' />
      <div className='flex flex-col gap-2'>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className='h-9 w-full' />
        ))}
      </div>
    </div>
  )
}

// Aviso compacto (sin datos o error): no ocupa media pantalla.
function ReportMessage({ text, error = false }: { text: string; error?: boolean }) {
  const Icon = error ? AlertCircle : FileSearch
  return (
    <div className='flex items-center gap-3 rounded-xl border border-dashed p-4'>
      <Icon className={cn('h-5 w-5 shrink-0', error ? 'text-destructive' : 'text-muted-foreground/70')} />
      <p className='text-muted-foreground text-sm'>{text}</p>
    </div>
  )
}
