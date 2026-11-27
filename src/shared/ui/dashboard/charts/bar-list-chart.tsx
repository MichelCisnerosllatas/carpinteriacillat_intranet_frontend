'use client'

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts'
import { cn } from '@/shared/lib/utils'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/shared/ui/chart'
import { chartColor } from '../chart-colors'
import { tooltipFormatter } from '../chart-tooltip-row'
import { formatNumber } from '../format'

export type BarListDatum = { label: string; value: number }

type BarListChartProps = {
  data: BarListDatum[]
  /** Nombre de la serie en el tooltip (ej. "Total vendido"). */
  seriesLabel: string
  valueFormatter?: (value: number) => string
  /** Formato corto para el eje (ej. "S/ 12 mil"). */
  axisFormatter?: (value: number) => string
  /** Etiqueta del eje de valores. */
  axisLabel?: string
  color?: string
  className?: string
}

// Ranking horizontal (top clientes, top productos...). Barras horizontales porque los
// nombres largos se leen mejor en el eje vertical que inclinados abajo.
export function BarListChart({
  data,
  seriesLabel,
  valueFormatter = (v) => formatNumber(v),
  axisFormatter,
  axisLabel,
  color = chartColor(0),
  className,
}: BarListChartProps) {
  const config: ChartConfig = { value: { label: seriesLabel, color } }
  // Altura según cantidad de filas: así 3 barras no quedan gigantes ni 10 apretadas.
  const height = Math.max(180, data.length * 36 + 40)

  return (
    <ChartContainer config={config} className={cn('aspect-auto w-full', className)} style={{ height }}>
      <BarChart data={data} layout='vertical' margin={{ left: 4, right: 56, top: 4, bottom: axisLabel ? 16 : 0 }}>
        <CartesianGrid horizontal={false} strokeDasharray='3 3' />
        <XAxis
          type='number'
          dataKey='value'
          tickLine={false}
          axisLine={false}
          tickFormatter={axisFormatter ?? valueFormatter}
          label={axisLabel ? { value: axisLabel, position: 'insideBottom', offset: -10, className: 'fill-muted-foreground text-xs' } : undefined}
        />
        <YAxis
          type='category'
          dataKey='label'
          width={130}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: string) => (v.length > 18 ? `${v.slice(0, 17)}…` : v)}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={tooltipFormatter(valueFormatter, { value: seriesLabel })} />} />
        <Bar dataKey='value' fill='var(--color-value)' radius={[0, 4, 4, 0]} maxBarSize={24} animationDuration={800}>
          {/* Etiqueta directa al final de cada barra: el ranking se lee sin pasar el mouse. */}
          <LabelList
            dataKey='value'
            position='right'
            className='fill-foreground'
            fontSize={11}
            formatter={(v: unknown) => (axisFormatter ?? valueFormatter)(Number(v))}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
