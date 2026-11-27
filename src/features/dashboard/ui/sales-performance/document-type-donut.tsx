'use client'

import { ChartCard, DonutChart, formatMoney, formatNumber, type Currency } from '@/shared/ui/dashboard'
import { useReportHref } from '../../lib/use-report-href'
import type { SalesByDocumentTypeDto } from '../../model/dashboard-sales-performance.dto'

type Props = {
  data: SalesByDocumentTypeDto[] | undefined
  currency: Currency
}

// Boletas vs facturas vs notas de venta: útil para ver qué tipo de cliente predomina.
export function DocumentTypeDonut({ data, currency }: Props) {
  // Botón ↗ "Ver en reportes" con el mismo periodo y moneda del dashboard.
  const reportHref = useReportHref('ventas')
  const rows = data ?? []
  const count = rows.reduce((sum, r) => sum + r.count, 0)

  return (
    <ChartCard
      href={reportHref}
      title='Por tipo de comprobante'
      description='Monto vendido según el comprobante emitido'
      isLoading={!data}
      isEmpty={rows.every((r) => r.total === 0)}
    >
      <DonutChart
        data={rows.map((r) => ({ label: r.name, value: r.total }))}
        valueFormatter={(v) => formatMoney(v, currency)}
        centerValue={formatNumber(count)}
        centerLabel='comprobantes'
      />
    </ChartCard>
  )
}
