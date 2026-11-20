'use client'

import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from 'recharts'
import { useReportHref } from '../../lib/use-report-href'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/shared/ui/chart'
import { ChartCard, chartColor, formatMoney, formatNumber, tooltipFormatter, type Currency } from '@/shared/ui/dashboard'
import type { SalesMonthlyDto } from '../../model/dashboard-sales-performance.dto'

type Props = {
  data: SalesMonthlyDto[] | undefined
  currency: Currency
}

const config: ChartConfig = {
  total: { label: 'Monto vendido', color: chartColor(0) },
  goal: { label: 'Meta', color: chartColor(1) },
  count: { label: 'N.º de ventas', color: chartColor(6) },
}

// Barras = monto vendido, línea punteada = meta (misma escala en soles, eje izquierdo) y
// línea sólida = cantidad de ventas (eje derecho, porque es una unidad distinta).
export function MonthlySalesComposedChart({ data, currency }: Props) {
  // Botón ↗ "Ver en reportes" con el mismo periodo y moneda del dashboard.
  const reportHref = useReportHref('ventas')
  const rows = data ?? []
  const isEmpty = rows.every((r) => r.total === 0 && r.count === 0 && !r.goal)

  // El tooltip formatea distinto según la serie: soles para monto/meta, número para cantidad.
  const formatByKey = (v: number, key: string) => (key === 'count' ? formatNumber(v) : formatMoney(v, currency))

  return (
    <ChartCard
      href={reportHref}
      title='Ventas por mes vs meta'
      description='Últimos 12 meses: monto, cantidad de ventas y meta mensual'
      isLoading={!data}
      isEmpty={isEmpty}
      footer='Los meses sin meta registrada no muestran la línea de meta.'
    >
      <ChartContainer config={config} className='aspect-auto h-[320px] w-full'>
        <ComposedChart data={rows} margin={{ top: 8, right: 4, left: 12, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray='3 3' />
          <XAxis dataKey='label' tickLine={false} axisLine={false} tickMargin={8} minTickGap={12} />
          <YAxis
            yAxisId='money'
            tickLine={false}
            axisLine={false}
            width={72}
            tickFormatter={(v: number) => formatMoney(v, currency, { compact: true })}
            label={{ value: `Monto (${currency})`, angle: -90, position: 'insideLeft', className: 'fill-muted-foreground text-xs' }}
          />
          <YAxis
            yAxisId='count'
            orientation='right'
            tickLine={false}
            axisLine={false}
            width={44}
            allowDecimals={false}
            label={{ value: 'Cantidad', angle: 90, position: 'insideRight', className: 'fill-muted-foreground text-xs' }}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={tooltipFormatter(formatByKey, { total: 'Monto vendido', goal: 'Meta', count: 'N.º de ventas' })}
              />
            }
          />
          <Bar yAxisId='money' dataKey='total' fill='var(--color-total)' radius={[4, 4, 0, 0]} maxBarSize={36} animationDuration={800} />
          <Line
            yAxisId='money'
            dataKey='goal'
            type='stepAfter'
            stroke='var(--color-goal)'
            strokeWidth={2}
            strokeDasharray='6 4'
            dot={false}
            connectNulls={false}
            animationDuration={800}
          />
          <Line
            yAxisId='count'
            dataKey='count'
            type='monotone'
            stroke='var(--color-count)'
            strokeWidth={2}
            dot={{ r: 3, strokeWidth: 2, fill: 'var(--card)' }}
            activeDot={{ r: 5 }}
            animationDuration={800}
          />
          <ChartLegend content={<ChartLegendContent />} />
        </ComposedChart>
      </ChartContainer>
    </ChartCard>
  )
}
