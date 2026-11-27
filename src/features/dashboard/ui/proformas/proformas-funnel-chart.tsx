'use client'

import { Funnel, FunnelChart, LabelList } from 'recharts'
import { useReportHref } from '../../lib/use-report-href'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/shared/ui/chart'
import { ChartCard, chartColor, formatMoney, formatNumber, formatPercent, tooltipFormatter, type Currency } from '@/shared/ui/dashboard'
import type { ProformasFunnelDto } from '../../model/dashboard-proformas.dto'

type Props = {
  data: ProformasFunnelDto[] | undefined
  currency: Currency
}

// Embudo Creadas → Aceptadas → Convertidas: muestra en qué etapa se "pierden" las cotizaciones.
export function ProformasFunnelChart({ data, currency }: Props) {
  // Botón ↗ "Ver en reportes" con el mismo periodo y moneda del dashboard.
  const reportHref = useReportHref('proformas')
  const rows = data ?? []
  const first = rows[0]?.count ?? 0

  const config: ChartConfig = Object.fromEntries(
    rows.map((r, i) => [r.stage, { label: r.label, color: chartColor(i) }])
  )
  const chartData = rows.map((r) => ({ ...r, fill: `var(--color-${r.stage})` }))

  return (
    <ChartCard
      href={reportHref}
      title='Embudo de proformas'
      description='De las proformas creadas en el periodo, cuántas avanzan a cada etapa'
      isLoading={!data}
      isEmpty={first === 0}
      footer={
        rows.length > 0
          ? rows
              .slice(1)
              .map((r) => `${r.label}: ${formatPercent(first > 0 ? (r.count / first) * 100 : null)} de las creadas`)
              .join(' · ')
          : undefined
      }
    >
      <ChartContainer config={config} className='aspect-auto h-[300px] w-full'>
        <FunnelChart margin={{ top: 8, right: 96, left: 8, bottom: 8 }}>
          <ChartTooltip
            content={
              <ChartTooltipContent
                hideLabel
                nameKey='stage'
                formatter={tooltipFormatter((v, key) => {
                  const row = rows.find((r) => r.label === key)
                  return `${formatNumber(v)} · ${formatMoney(row?.total ?? 0, currency)}`
                })}
              />
            }
          />
          <Funnel dataKey='count' nameKey='label' data={chartData} isAnimationActive animationDuration={900} stroke='var(--card)' strokeWidth={2}>
            {/* Cantidad dentro del embudo y nombre de la etapa a la derecha (lectura sin tooltip). */}
            <LabelList dataKey='count' position='center' className='fill-white font-semibold' stroke='none' fontSize={13} />
            <LabelList dataKey='label' position='right' className='fill-foreground' stroke='none' fontSize={12} />
          </Funnel>
          <ChartLegend content={<ChartLegendContent nameKey='stage' />} />
        </FunnelChart>
      </ChartContainer>
    </ChartCard>
  )
}
