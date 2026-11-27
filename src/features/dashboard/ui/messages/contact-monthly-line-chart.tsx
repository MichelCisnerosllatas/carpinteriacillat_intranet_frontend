'use client'

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import { useReportHref } from '../../lib/use-report-href'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/shared/ui/chart'
import { ChartCard, chartColor, formatNumber, tooltipFormatter } from '@/shared/ui/dashboard'
import type { ContactMonthlyDto } from '../../model/dashboard-messages.dto'

const config: ChartConfig = { count: { label: 'Mensajes', color: chartColor(0) } }

// Una sola serie: no lleva caja de leyenda, el título ya dice qué se mide.
export function ContactMonthlyLineChart({ data }: { data: ContactMonthlyDto[] | undefined }) {
  // Botón ↗ "Ver en reportes" con el mismo periodo y moneda del dashboard.
  const reportHref = useReportHref('mensajes')
  const rows = data ?? []

  return (
    <ChartCard
      href={reportHref}
      title='Mensajes de contacto por mes'
      description='Últimos 12 meses'
      isLoading={!data}
      isEmpty={rows.every((r) => r.count === 0)}
    >
      <ChartContainer config={config} className='aspect-auto h-[280px] w-full'>
        <LineChart data={rows} margin={{ top: 12, right: 12, left: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray='3 3' />
          <XAxis dataKey='label' tickLine={false} axisLine={false} tickMargin={8} minTickGap={12} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={52}
            allowDecimals={false}
            label={{ value: 'Mensajes', angle: -90, position: 'insideLeft', className: 'fill-muted-foreground text-xs' }}
          />
          <ChartTooltip content={<ChartTooltipContent indicator='line' formatter={tooltipFormatter((v) => formatNumber(v), { count: 'Mensajes' })} />} />
          <Line
            dataKey='count'
            type='monotone'
            stroke='var(--color-count)'
            strokeWidth={2}
            dot={{ r: 3, strokeWidth: 2, fill: 'var(--card)' }}
            activeDot={{ r: 5 }}
            animationDuration={900}
          />
        </LineChart>
      </ChartContainer>
    </ChartCard>
  )
}
