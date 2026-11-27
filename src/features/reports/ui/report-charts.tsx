'use client'

import { ChartCard, toNumber, type Currency } from '@/shared/ui/dashboard'
import { cn } from '@/shared/lib/utils'
import type { ReportChartDto } from '../model/report.dto'
import { ReportChart } from './report-chart'

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
