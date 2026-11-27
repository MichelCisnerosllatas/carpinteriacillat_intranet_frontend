'use client'

import { ChartCard, DonutChart, formatMoney, type Currency } from '@/shared/ui/dashboard'
import { useReportHref } from '../../lib/use-report-href'
import type { SalesByTypeDto } from '../../model/dashboard-sales-performance.dto'

type Props = {
  data: SalesByTypeDto[] | undefined
  currency: Currency
}

// Productos vs servicios vs ítems libres (líneas escritas a mano, sin producto del catálogo).
export function SalesByTypeDonut({ data, currency }: Props) {
  // Botón ↗ "Ver en reportes" con el mismo periodo y moneda del dashboard.
  const reportHref = useReportHref('productos')
  const rows = data ?? []
  const total = rows.reduce((sum, r) => sum + r.total, 0)

  return (
    <ChartCard
      href={reportHref}
      title='Productos, servicios e ítems libres'
      description='Composición del monto vendido'
      isLoading={!data}
      isEmpty={total === 0}
    >
      <DonutChart
        data={rows.map((r) => ({ label: r.label, value: r.total }))}
        valueFormatter={(v) => formatMoney(v, currency)}
        centerValue={formatMoney(total, currency, { compact: true })}
        centerLabel='Total'
      />
    </ChartCard>
  )
}
