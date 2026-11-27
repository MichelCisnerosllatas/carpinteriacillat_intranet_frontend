'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { useReportHref } from '../../lib/use-report-href'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/shared/ui/chart'
import { ChartCard, chartColor, formatMoney, tooltipFormatter, type Currency } from '@/shared/ui/dashboard'
import type { SummaryMonthlyDto } from '../../model/dashboard-summary.dto'

type Props = {
  data: SummaryMonthlyDto[] | undefined
  currency: Currency
}

const config: ChartConfig = {
  sales_total: { label: 'Ventas', color: chartColor(0) },
  collected_total: { label: 'Cobros', color: chartColor(2) },
}

// Ventas vs cobros de los últimos 12 meses: muestra si lo vendido se está cobrando a tiempo.
// Las áreas se superponen (no se apilan) porque los cobros son parte de las ventas, no un extra.
export function SalesCollectionsAreaChart({ data, currency }: Props) {
  // Botón ↗ "Ver en reportes" con el mismo periodo y moneda del dashboard.
  const reportHref = useReportHref('ventas')
  const rows = data ?? []
  const isEmpty = rows.every((r) => r.sales_total === 0 && r.collected_total === 0)
  const money = (v: number) => formatMoney(v, currency)

  return (
    <ChartCard
      href={reportHref}
      title='Ventas vs cobros'
      description='Últimos 12 meses hasta la fecha final del filtro'
      isLoading={!data}
      isEmpty={isEmpty}
      footer='Las ventas anuladas no se suman. Los cobros se agrupan por fecha de pago.'
    >
      <ChartContainer config={config} className='aspect-auto h-[300px] w-full'>
        <AreaChart data={rows} margin={{ top: 8, right: 8, left: 12, bottom: 0 }}>
          {/* Degradados: el área se desvanece hacia abajo para que ambas series se vean al superponerse. */}
          <defs>
            <linearGradient id='fillSales' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='var(--color-sales_total)' stopOpacity={0.45} />
              <stop offset='95%' stopColor='var(--color-sales_total)' stopOpacity={0.03} />
            </linearGradient>
            <linearGradient id='fillCollected' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='var(--color-collected_total)' stopOpacity={0.45} />
              <stop offset='95%' stopColor='var(--color-collected_total)' stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray='3 3' />
          <XAxis dataKey='label' tickLine={false} axisLine={false} tickMargin={8} minTickGap={16} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={72}
            tickFormatter={(v: number) => formatMoney(v, currency, { compact: true })}
            label={{ value: `Monto (${currency})`, angle: -90, position: 'insideLeft', className: 'fill-muted-foreground text-xs' }}
          />
          <ChartTooltip content={<ChartTooltipContent indicator='line' formatter={tooltipFormatter(money, { sales_total: 'Ventas', collected_total: 'Cobros' })} />} />
          <Area dataKey='sales_total' type='monotone' fill='url(#fillSales)' stroke='var(--color-sales_total)' strokeWidth={2} animationDuration={900} />
          <Area dataKey='collected_total' type='monotone' fill='url(#fillCollected)' stroke='var(--color-collected_total)' strokeWidth={2} animationDuration={900} />
          <ChartLegend content={<ChartLegendContent />} />
        </AreaChart>
      </ChartContainer>
    </ChartCard>
  )
}
