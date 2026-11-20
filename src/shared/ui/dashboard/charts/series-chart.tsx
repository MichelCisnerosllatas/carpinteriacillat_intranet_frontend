'use client'

import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from 'recharts'
import { cn } from '@/shared/lib/utils'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/shared/ui/chart'
import { chartColor } from '../chart-colors'
import { tooltipFormatter } from '../chart-tooltip-row'

export type SeriesDef = {
  key: string
  label: string
  /** Cómo formatear los valores de esta serie (moneda, cantidad, %...). */
  format: (value: number) => string
  /** Formato corto para el eje (ej. "S/ 12 mil"). Si no se envía, se usa `format`. */
  axisFormat?: (value: number) => string
  /**
   * Las series con distinta unidad (ej. soles y cantidad) no se pueden comparar en la misma
   * escala: la que tenga `unit` distinta a la primera va al eje derecho.
   */
  unit?: string
}

type SeriesChartProps = {
  /** 'line' = evolución en el tiempo; 'bar' = columnas agrupadas (comparar categorías). */
  type: 'line' | 'bar'
  data: Record<string, unknown>[]
  /** Campo de cada fila que va en el eje X (ej. "label"). */
  xKey: string
  series: SeriesDef[]
  className?: string
}

// Gráfico genérico de una o varias series (líneas o columnas). Lo usa la pantalla de Reportes,
// que recibe del backend qué series dibujar, así no hace falta un componente por gráfico.
export function SeriesChart({ type, data, xKey, series, className }: SeriesChartProps) {
  // Cada serie recibe un color en orden fijo; ChartContainer lo publica como --color-<key>.
  const config: ChartConfig = Object.fromEntries(
    series.map((s, i) => [s.key, { label: s.label, color: chartColor(i) }])
  )

  // Eje izquierdo = unidad de la primera serie; eje derecho = cualquier otra unidad.
  const leftUnit = series[0]?.unit
  const rightSeries = series.find((s) => s.unit !== leftUnit)
  const axisOf = (s: SeriesDef) => (s.unit === leftUnit ? 'left' : 'right')
  const left = series[0]

  // El tooltip usa el formato de cada serie (soles para monto, número para cantidad).
  const formatByKey = (value: number, key: string) => {
    const s = series.find((item) => item.key === key)
    return s ? s.format(value) : String(value)
  }
  const labels = Object.fromEntries(series.map((s) => [s.key, s.label]))

  return (
    <ChartContainer config={config} className={cn('aspect-auto h-[280px] w-full', className)}>
      <ComposedChart data={data} margin={{ top: 8, right: rightSeries ? 4 : 12, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray='3 3' />
        <XAxis dataKey={xKey} tickLine={false} axisLine={false} tickMargin={8} minTickGap={12} />
        <YAxis
          yAxisId='left'
          tickLine={false}
          axisLine={false}
          width={64}
          tickFormatter={(v: number) => (left?.axisFormat ?? left?.format ?? String)(v)}
        />
        {rightSeries && (
          <YAxis
            yAxisId='right'
            orientation='right'
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={(v: number) => (rightSeries.axisFormat ?? rightSeries.format)(v)}
          />
        )}
        <ChartTooltip content={<ChartTooltipContent formatter={tooltipFormatter(formatByKey, labels)} />} />

        {series.map((s) =>
          type === 'line' ? (
            <Line
              key={s.key}
              yAxisId={axisOf(s)}
              dataKey={s.key}
              type='monotone'
              stroke={`var(--color-${s.key})`}
              strokeWidth={2}
              dot={data.length <= 31 ? { r: 2.5, strokeWidth: 2, fill: 'var(--card)' } : false}
              activeDot={{ r: 5 }}
              animationDuration={800}
            />
          ) : (
            <Bar
              key={s.key}
              yAxisId={axisOf(s)}
              dataKey={s.key}
              fill={`var(--color-${s.key})`}
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
              animationDuration={800}
            />
          )
        )}

        {/* La leyenda solo hace falta cuando hay más de una serie (con una, el título la nombra). */}
        {series.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
      </ComposedChart>
    </ChartContainer>
  )
}
