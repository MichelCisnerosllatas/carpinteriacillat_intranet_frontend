'use client'

import { BarListChart, ChartCard, chartColor, formatMoney, type Currency } from '@/shared/ui/dashboard'
import { useReportHref } from '../../lib/use-report-href'
import type { SalesTopProductDto } from '../../model/dashboard-sales-performance.dto'

type Props = {
  data: SalesTopProductDto[] | undefined
  currency: Currency
}

export function TopProductsChart({ data, currency }: Props) {
  // Botón ↗ "Ver en reportes" con el mismo periodo y moneda del dashboard.
  const reportHref = useReportHref('productos')
  // Top 5 en el dashboard; el top 10 completo está en Reportes (botón ↗).
  const rows = (data ?? []).slice(0, 5)

  return (
    <ChartCard
      href={reportHref}
      title='Top 5 productos y servicios'
      description='Ordenados por monto vendido'
      isLoading={!data}
      isEmpty={rows.length === 0}
    >
      <BarListChart
        data={rows.map((r) => ({ label: r.name, value: r.total }))}
        seriesLabel='Total vendido'
        valueFormatter={(v) => formatMoney(v, currency)}
        axisFormatter={(v) => formatMoney(v, currency, { compact: true })}
        axisLabel={`Monto (${currency})`}
        color={chartColor(2)}
      />
    </ChartCard>
  )
}
