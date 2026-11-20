'use client'

import { Area, Bar, CartesianGrid, ComposedChart, XAxis, YAxis } from 'recharts'
import { useReportHref } from '../../lib/use-report-href'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/shared/ui/chart'
import { ChartCard, chartColor, formatMoney, tooltipFormatter, type Currency } from '@/shared/ui/dashboard'
import type { ProformasMonthlyDto } from '../../model/dashboard-proformas.dto'

type Props = {
  data: ProformasMonthlyDto[] | undefined
  currency: Currency
}

const config: ChartConfig = {
  quoted_total: { label: 'Cotizado', color: chartColor(0) },
  sold_total: { label: 'Vendido', color: chartColor(2) },
}

// Área = monto cotizado; barras = monto que realmente se vendió desde proformas.
// La distancia entre ambos es el dinero cotizado que no se concretó.
export function QuotedVsSoldChart({ data, currency }: Props) {
  // Botón ↗ "Ver en reportes" con el mismo periodo y moneda del dashboard.
  const reportHref = useReportHref('proformas')
  const rows = data ?? []
  const money = (v: number) => formatMoney(v, currency)

  return (
    <ChartCard
      href={reportHref}
      title='Cotizado vs vendido'
      description='Últimos 12 meses'
      isLoading={!data}
      isEmpty={rows.every((r) => r.quoted_total === 0 && r.sold_total === 0)}
    >
      <ChartContainer config={config} className='aspect-auto h-[300px] w-full'>
        <ComposedChart data={rows} margin={{ top: 8, right: 8, left: 12, bottom: 0 }}>
          <defs>
            <linearGradient id='fillQuoted' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='var(--color-quoted_total)' stopOpacity={0.4} />
              <stop offset='95%' stopColor='var(--color-quoted_total)' stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray='3 3' />
          <XAxis dataKey='label' tickLine={false} axisLine={false} tickMargin={8} minTickGap={12} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={72}
            tickFormatter={(v: number) => formatMoney(v, currency, { compact: true })}
            label={{ value: `Monto (${currency})`, angle: -90, position: 'insideLeft', className: 'fill-muted-foreground text-xs' }}
          />
          <ChartTooltip content={<ChartTooltipContent indicator='line' formatter={tooltipFormatter(money, { quoted_total: 'Cotizado', sold_total: 'Vendido' })} />} />
          <Area dataKey='quoted_total' type='monotone' fill='url(#fillQuoted)' stroke='var(--color-quoted_total)' strokeWidth={2} animationDuration={900} />
          <Bar dataKey='sold_total' fill='var(--color-sold_total)' radius={[4, 4, 0, 0]} maxBarSize={28} animationDuration={900} />
          <ChartLegend content={<ChartLegendContent />} />
        </ComposedChart>
      </ChartContainer>
    </ChartCard>
  )
}
