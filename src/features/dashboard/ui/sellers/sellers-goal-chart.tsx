'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/shared/ui/chart'
import { ChartCard, chartColor, formatMoney, formatPercent, type Currency } from '@/shared/ui/dashboard'
import { useReportHref } from '../../lib/use-report-href'
import type { SalesBySellerDto } from '../../model/dashboard-sales-performance.dto'

type Props = {
  data: SalesBySellerDto[] | undefined
  currency: Currency
}

const config: ChartConfig = {
  goal: { label: 'Meta', color: chartColor(1) },
  total: { label: 'Logrado', color: chartColor(0) },
}

// Barras agrupadas Meta vs Logrado por vendedor. Solo entran los vendedores que tienen meta
// registrada (sin meta no hay nada que comparar).
export function SellersGoalChart({ data, currency }: Props) {
  // Botón ↗ "Ver en reportes" con el mismo periodo y moneda del dashboard.
  const reportHref = useReportHref('vendedores')
  const rows = (data ?? []).filter((r) => r.goal != null).slice(0, 10)

  return (
    <ChartCard
      href={reportHref}
      title='Meta vs logrado'
      description='Vendedores con meta registrada en el periodo'
      isLoading={!data}
      isEmpty={rows.length === 0}
    >
      <ChartContainer config={config} className='aspect-auto h-[300px] w-full'>
        <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray='3 3' />
          <XAxis
            dataKey='seller_name'
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            interval={0}
            tickFormatter={(v: string) => (v.length > 12 ? `${v.slice(0, 11)}…` : v)}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={64}
            tickFormatter={(v: number) => formatMoney(v, currency, { compact: true })}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                // Cada fila: "■ Meta  S/ 10,000.00"; en Logrado se agrega el % de avance del vendedor.
                formatter={(value, name, item) => {
                  const row = item.payload as SalesBySellerDto
                  const isTotal = name === 'total'
                  return (
                    <div className='flex w-full min-w-[11rem] items-center gap-2'>
                      <span
                        className='h-2.5 w-2.5 shrink-0 rounded-[2px] bg-(--row-color)'
                        style={{ ['--row-color' as string]: item.color }}
                      />
                      <span className='text-muted-foreground'>{isTotal ? 'Logrado' : 'Meta'}</span>
                      <span className='text-foreground ml-auto font-mono font-medium tabular-nums'>
                        {formatMoney(Number(value), currency)}
                        {isTotal && ` · ${formatPercent(row.progress_pct)}`}
                      </span>
                    </div>
                  )
                }}
              />
            }
          />
          <Bar dataKey='goal' fill='var(--color-goal)' radius={[4, 4, 0, 0]} maxBarSize={32} animationDuration={800} />
          <Bar dataKey='total' fill='var(--color-total)' radius={[4, 4, 0, 0]} maxBarSize={32} animationDuration={800} />
          <ChartLegend content={<ChartLegendContent />} />
        </BarChart>
      </ChartContainer>
    </ChartCard>
  )
}
