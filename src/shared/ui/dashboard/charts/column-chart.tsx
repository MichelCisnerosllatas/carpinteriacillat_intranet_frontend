'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { cn } from '@/shared/lib/utils'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/shared/ui/chart'
import { chartColor } from '../chart-colors'
import { tooltipFormatter } from '../chart-tooltip-row'
import { formatNumber } from '../format'

export type ColumnDatum = { label: string; value: number }

type ColumnChartProps = {
  data: ColumnDatum[]
  seriesLabel: string
  valueFormatter?: (value: number) => string
  axisFormatter?: (value: number) => string
  xAxisLabel?: string
  yAxisLabel?: string
  color?: string
  className?: string
}

// Columnas verticales de una sola serie (distribuciones: antigüedad de deuda, estrellas,
// versiones de app...). Una sola serie = un solo color y sin caja de leyenda: el título la nombra.
export function ColumnChart({
  data,
  seriesLabel,
  valueFormatter = (v) => formatNumber(v),
  axisFormatter,
  xAxisLabel,
  yAxisLabel,
  color = chartColor(0),
  className,
}: ColumnChartProps) {
  const config: ChartConfig = { value: { label: seriesLabel, color } }

  return (
    <ChartContainer config={config} className={cn('aspect-auto h-[280px] w-full', className)}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: yAxisLabel ? 12 : 0, bottom: xAxisLabel ? 16 : 0 }}>
        <CartesianGrid vertical={false} strokeDasharray='3 3' />
        <XAxis
          dataKey='label'
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          interval='preserveStartEnd'
          label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -10, className: 'fill-muted-foreground text-xs' } : undefined}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={yAxisLabel ? 64 : 48}
          allowDecimals={false}
          tickFormatter={axisFormatter ?? valueFormatter}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', className: 'fill-muted-foreground text-xs' } : undefined}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={tooltipFormatter(valueFormatter, { value: seriesLabel })} />} />
        <Bar dataKey='value' fill='var(--color-value)' radius={[4, 4, 0, 0]} maxBarSize={48} animationDuration={800} />
      </BarChart>
    </ChartContainer>
  )
}
