'use client'

import { BarListChart, ChartCard, formatMoney, type Currency } from '@/shared/ui/dashboard'
import { useReportHref } from '../../lib/use-report-href'
import type { SalesBySellerDto } from '../../model/dashboard-sales-performance.dto'

type Props = {
  data: SalesBySellerDto[] | undefined
  currency: Currency
}

// Ranking de vendedores por monto vendido (el backend ya los manda ordenados de mayor a menor).
export function SellersRankingChart({ data, currency }: Props) {
  // Botón ↗ "Ver en reportes" con el mismo periodo y moneda del dashboard.
  const reportHref = useReportHref('vendedores')
  // Top 10: el ranking completo está en la pestaña Vendedores de Reportes.
  const rows = (data ?? []).slice(0, 10)

  return (
    <ChartCard
      href={reportHref}
      title='Ranking de vendedores'
      description='Monto vendido en el periodo'
      isLoading={!data}
      isEmpty={rows.every((r) => r.total === 0)}
    >
      <BarListChart
        data={rows.map((r) => ({ label: r.seller_name, value: r.total }))}
        seriesLabel='Monto vendido'
        valueFormatter={(v) => formatMoney(v, currency)}
        axisFormatter={(v) => formatMoney(v, currency, { compact: true })}
      />
    </ChartCard>
  )
}
