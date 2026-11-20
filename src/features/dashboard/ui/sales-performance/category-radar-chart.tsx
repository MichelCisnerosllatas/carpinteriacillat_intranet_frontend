'use client'

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts'
import { useReportHref } from '../../lib/use-report-href'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/shared/ui/chart'
import { BarListChart, ChartCard, chartColor, formatMoney, tooltipFormatter, type Currency } from '@/shared/ui/dashboard'
import type { SalesByCategoryDto } from '../../model/dashboard-sales-performance.dto'

type Props = {
  data: SalesByCategoryDto[] | undefined
  currency: Currency
}

const config: ChartConfig = { total: { label: 'Total vendido', color: chartColor(6) } }

// Radar por categoría de mueble: con 5-6 categorías forma un hexágono que muestra de un
// vistazo qué líneas de producto pesan más.
export function CategoryRadarChart({ data, currency }: Props) {
  // Botón ↗ "Ver en reportes" con el mismo periodo y moneda del dashboard.
  const reportHref = useReportHref('productos')
  const rows = data ?? []
  const money = (v: number) => formatMoney(v, currency)

  return (
    <ChartCard
      href={reportHref}
      title='Ventas por categoría'
      description='Categoría del mueble asociado al producto'
      isLoading={!data}
      isEmpty={rows.every((r) => r.total === 0)}
    >
      {rows.length < 3 ? (
        // Un radar necesita al menos 3 ejes para formar una figura; con menos se usan barras.
        <BarListChart
          data={rows.map((r) => ({ label: r.category, value: r.total }))}
          seriesLabel='Total vendido'
          valueFormatter={money}
          axisFormatter={(v) => formatMoney(v, currency, { compact: true })}
          color={chartColor(6)}
        />
      ) : (
        <ChartContainer config={config} className='mx-auto aspect-square max-h-[320px] w-full'>
          <RadarChart data={rows} outerRadius='72%'>
            <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={tooltipFormatter(money, { total: 'Total vendido' })} />} />
            <PolarGrid gridType='polygon' />
            <PolarAngleAxis dataKey='category' tick={{ fontSize: 11 }} />
            <Radar
              dataKey='total'
              fill='var(--color-total)'
              fillOpacity={0.35}
              stroke='var(--color-total)'
              strokeWidth={2}
              dot={{ r: 3, fillOpacity: 1 }}
              animationDuration={900}
            />
          </RadarChart>
        </ChartContainer>
      )}
    </ChartCard>
  )
}
