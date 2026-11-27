'use client'

import { Cell, Label, Pie, PieChart } from 'recharts'
import { cn } from '@/shared/lib/utils'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/shared/ui/chart'
import { chartColor, foldIntoOthers } from '../chart-colors'
import { tooltipFormatter } from '../chart-tooltip-row'
import { formatNumber } from '../format'

export type DonutDatum = { label: string; value: number }

type DonutChartProps = {
  data: DonutDatum[]
  /** Cómo se muestra cada valor en el tooltip (moneda, cantidad...). */
  valueFormatter?: (value: number) => string
  /** 'donut' deja un hueco al centro para el total; 'pie' es el pastel completo. */
  variant?: 'donut' | 'pie'
  centerValue?: string
  centerLabel?: string
  className?: string
}

// Gráfico de dona/pastel genérico: recibe solo { label, value } y se encarga de colores,
// leyenda, tooltip y texto central. Lo reutilizan todos los dashboards.
export function DonutChart({
  data,
  valueFormatter = (v) => formatNumber(v),
  variant = 'donut',
  centerValue,
  centerLabel,
  className,
}: DonutChartProps) {
  // Las porciones en 0 no se dibujan (solo ensuciarían la leyenda).
  const items = foldIntoOthers(data.filter((d) => d.value > 0))
  const total = items.reduce((sum, d) => sum + d.value, 0)

  // Las claves internas son "s0", "s1"... porque las etiquetas pueden tener espacios o tildes
  // y se usan para nombrar variables CSS (--color-s0).
  const config: ChartConfig = Object.fromEntries(
    items.map((d, i) => [`s${i}`, { label: d.label, color: chartColor(i) }])
  )
  const chartData = items.map((d, i) => ({ ...d, key: `s${i}`, fill: `var(--color-s${i})` }))

  // El tooltip agrega el % que representa cada porción sobre el total.
  const formatWithShare = (value: number) =>
    `${valueFormatter(value)} · ${total > 0 ? Math.round((value / total) * 100) : 0}%`

  return (
    <ChartContainer config={config} className={cn('mx-auto aspect-square max-h-[320px] w-full', className)}>
      <PieChart>
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel formatter={tooltipFormatter(formatWithShare)} />} />
        <Pie
          data={chartData}
          dataKey='value'
          nameKey='label'
          innerRadius={variant === 'donut' ? '58%' : 0}
          outerRadius='85%'
          paddingAngle={items.length > 1 ? 2 : 0}
          stroke='var(--card)'
          strokeWidth={2}
          animationDuration={800}
        >
          {chartData.map((d) => (
            <Cell key={d.key} fill={d.fill} />
          ))}
          {variant === 'donut' && centerValue && (
            <Label
              content={({ viewBox }) => {
                if (!viewBox || !('cx' in viewBox) || !('cy' in viewBox)) return null
                const cx = Number(viewBox.cx)
                const cy = Number(viewBox.cy)
                return (
                  <text x={cx} y={cy} textAnchor='middle' dominantBaseline='middle'>
                    <tspan x={cx} y={cy - 6} className='fill-foreground text-xl font-bold'>
                      {centerValue}
                    </tspan>
                    {centerLabel && (
                      <tspan x={cx} y={cy + 16} className='fill-muted-foreground text-xs'>
                        {centerLabel}
                      </tspan>
                    )}
                  </text>
                )
              }}
            />
          )}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey='key' />} />
      </PieChart>
    </ChartContainer>
  )
}
