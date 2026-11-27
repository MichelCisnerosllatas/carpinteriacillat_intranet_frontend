'use client'

import { Info, Loader2, RefreshCw } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { IconButton } from '@/shared/ui/icon-button'
import { formatNumber, isValidRange, toNumber } from '@/shared/ui/dashboard'
import { useCan } from '@/features/auth/hooks/usePermission'
import { REPORTS } from '../data/reports.config'
import { reportPermission } from '../lib/report-permission'
import { buildReportParams, selectActiveReport, useReportStore } from '../stores/useReportStore'
import { ReportCharts } from './report-charts'
import { ReportExportButtons } from './report-export-buttons'
import { ReportFilters } from './report-filters'
import { ReportKpis } from './report-kpis'
import { ReportMessage } from './report-message'
import { ReportSkeleton } from './report-skeleton'
import { ReportTable } from './report-table'
import { SellerScope } from './seller-scope'

// Límite de filas que devuelve el backend (contrato §8). Si se llega, se avisa al usuario.
const MAX_ROWS = 5000

// Contenido de la pestaña activa: filtros, KPIs, gráficos y tabla.
export function ReportPanel() {
  const state = useReportStore()
  const { filters, data, isFetching, isError, message, load } = state
  const report = selectActiveReport(state)
  const config = REPORTS[report]
  const rangeOk = isValidRange(filters)
  const canViewAll = useCan('sales.view_all')

  // Bloques del reporte según el rol: report_<slug>.kpis / charts / table (ver ROLES_Y_PERMISOS.md).
  // El backend ya los manda vacíos sin permiso; aquí además no se pintan.
  const canKpis = useCan(reportPermission(report, 'kpis'))
  const canCharts = useCan(reportPermission(report, 'charts'))
  const canTable = useCan(reportPermission(report, 'table'))
  const canExport = useCan(reportPermission(report, 'export'))
  const hasAnyBlock = canKpis || canCharts || canTable

  // Solo se muestra el resultado si corresponde al reporte activo (evita ver otro mientras carga).
  const result = data?.report === report ? data : null
  const currency = result?.filters.currency ?? filters.currency
  const rows = canTable ? (result?.rows ?? []) : []

  // "Todo vacío" = sin filas y sin gráficos con datos: se muestra un solo aviso compacto.
  // Si el rol solo ve los KPIs, no se considera vacío (los KPIs se muestran aunque sean 0).
  const hasChartData =
    canCharts &&
    (result?.charts ?? []).some((chart) =>
      chart.data.some((row) => chart.series.some((s) => toNumber(row[s.key]) !== 0))
    )
  const isAllEmpty = result !== null && (canTable || canCharts) && rows.length === 0 && !hasChartData

  // Nombre del vendedor filtrado, si el backend lo devuelve dentro de `filters`.
  const sellerName = typeof result?.filters.seller_name === 'string' ? result.filters.seller_name : null

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

      {config.usesSeller && <SellerScope canViewAll={canViewAll} sellerId={state.sellerId} sellerName={sellerName} />}

      {config.note && (
        <p className='text-muted-foreground flex items-start gap-1.5 text-xs'>
          <Info className='mt-0.5 h-3.5 w-3.5 shrink-0' /> {config.note}
        </p>
      )}
      {!rangeOk && (
        <p className='text-destructive text-xs'>Revisa el rango: la fecha “Desde” debe ser anterior o igual a “Hasta”.</p>
      )}

      {!hasAnyBlock ? (
        // El rol puede abrir la pestaña pero no tiene ningún bloque visible.
        <ReportMessage
          text={
            canExport
              ? 'Tu rol no tiene habilitados los indicadores, gráficos ni la tabla de este reporte. Puedes descargarlo con los botones de exportar.'
              : 'Tu rol no tiene habilitados los indicadores, gráficos ni la tabla de este reporte.'
          }
        />
      ) : isError && !isFetching ? (
        <ReportMessage error text={message ?? 'No se pudo generar el reporte.'} />
      ) : !result ? (
        rangeOk && <ReportSkeleton />
      ) : isAllEmpty ? (
        <ReportMessage text='No hay registros para los filtros seleccionados.' />
      ) : (
        // Mientras se recarga se deja ver el resultado anterior, un poco atenuado.
        <div className={cn('flex min-w-0 flex-col gap-4 transition-opacity', isFetching && 'opacity-60')}>
          {canKpis && <ReportKpis kpis={result.kpis} currency={currency} />}
          {canCharts && <ReportCharts charts={result.charts} currency={currency} />}

          {rows.length > 0 && (
            <>
              <p className='text-muted-foreground text-sm'>
                {formatNumber(rows.length)} registros
                {rows.length >= MAX_ROWS && ' (se muestran los primeros 5,000: acota el rango o exporta por partes)'}
              </p>
              {/* key: al cambiar el resultado se cierran las filas abiertas y vuelve a la primera página. */}
              <ReportTable
                key={`${report}-${result.filters.date_from}-${result.filters.date_to}-${rows.length}`}
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
