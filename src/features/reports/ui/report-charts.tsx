'use client'

import {
  BarListChart,
  ChartCard,
  DonutChart,
  SeriesChart,
  toNumber,
  type Currency,
  type SeriesDef,
} from '@/shared/ui/dashboard'
import { cn } from '@/shared/lib/utils'
import { formatReportAxis, formatReportCell } from '../lib/format-cell'
import type { ReportChartDto } from '../model/report.dto'

type Props = {
  charts: ReportChartDto[] | undefined
  currency: Currency
}

// Un gráfico "tiene datos" si alguna de sus series tiene un valor distinto de 0.
function hasData(chart: ReportChartDto): boolean {
  return chart.data.some((row) => chart.series.some((s) => toNumber(row[s.key]) !== 0))
}

// Pinta los gráficos que manda el backend. Los que vienen vacíos NO se pintan
// (así no quedan cajas vacías); si no queda ninguno, no se muestra la sección.
export function ReportCharts({ charts, currency }: Props) {
  const visible = (charts ?? []).filter(hasData)
  if (visible.length === 0) return null

  return (
    <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
      {visible.map((chart) => (
        <ChartCard
          key={chart.key}
          title={chart.title}
          description={chart.subtitle ?? undefined}
          // Las líneas (evolución por día) necesitan todo el ancho para leerse bien.
          className={cn(chart.type === 'line' && 'lg:col-span-2')}
        >
          <ReportChart chart={chart} currency={currency} />
        </ChartCard>
      ))}
    </div>
  )
}

// Elige el gráfico del kit según `chart.type`.
function ReportChart({ chart, currency }: { chart: ReportChartDto; currency: Currency }) {
  const first = chart.series[0]
  if (!first) return null

  const format = (type: typeof first.type) => (v: number) => formatReportCell(v, type, currency)
  const axisFormat = (type: typeof first.type) => (v: number) => formatReportAxis(v, type, currency)

  // Donut, barras horizontales y embudo usan una sola serie: { label, value }.
  const singleSeries = chart.data.map((row) => ({
    label: String(row[chart.x_key] ?? '—'),
    value: toNumber(row[first.key]),
  }))

  switch (chart.type) {
    case 'donut':
      return <DonutChart data={singleSeries} valueFormatter={format(first.type)} />

    case 'bar_horizontal':
      return (
        <BarListChart
          data={singleSeries}
          seriesLabel={first.label}
          valueFormatter={format(first.type)}
          axisFormatter={axisFormat(first.type)}
        />
      )

    case 'funnel': {
      // Embudo como barras horizontales en orden: cada etapa muestra además el % sobre la primera.
      const base = singleSeries[0]?.value ?? 0
      const withShare = (v: number) =>
        base > 0 ? `${format(first.type)(v)} (${Math.round((v / base) * 100)}%)` : format(first.type)(v)
      return <BarListChart data={singleSeries} seriesLabel={first.label} valueFormatter={withShare} />
    }

    case 'line':
    case 'bar': {
      // La unidad de cada serie decide su eje: soles a la izquierda, cantidades a la derecha.
      const series: SeriesDef[] = chart.series.map((s) => ({
        key: s.key,
        label: s.label,
        unit: s.type,
        format: format(s.type),
        axisFormat: axisFormat(s.type),
      }))
      // Los montos pueden llegar como string ("120.50"): se convierten a número para Recharts.
      const data = chart.data.map((row) => ({
        ...row,
        ...Object.fromEntries(chart.series.map((s) => [s.key, toNumber(row[s.key])])),
      }))
      return <SeriesChart type={chart.type} data={data} xKey={chart.x_key} series={series} />
    }

    default:
      return null
  }
}
