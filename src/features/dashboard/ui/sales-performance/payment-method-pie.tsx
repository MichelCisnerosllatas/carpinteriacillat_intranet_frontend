'use client'

import { ChartCard, DonutChart, formatMoney, type Currency } from '@/shared/ui/dashboard'
import { useReportHref } from '../../lib/use-report-href'
import type { SalesByPaymentMethodDto } from '../../model/dashboard-sales-performance.dto'

type Props = {
  data: SalesByPaymentMethodDto[] | undefined
  currency: Currency
}

// Pagos recibidos en el periodo (por fecha de pago, no de venta) según el método usado.
export function PaymentMethodPie({ data, currency }: Props) {
  // Botón ↗ "Ver en reportes" con el mismo periodo y moneda del dashboard.
  const reportHref = useReportHref('pagos', 'recibidos')
  const rows = data ?? []

  return (
    <ChartCard
      href={reportHref}
      title='Por método de pago'
      description='Pagos recibidos en el periodo'
      isLoading={!data}
      isEmpty={rows.every((r) => r.total === 0)}
      emptyMessage='No se registraron pagos en el periodo.'
    >
      <DonutChart
        variant='pie'
        data={rows.map((r) => ({ label: r.label, value: r.total }))}
        valueFormatter={(v) => formatMoney(v, currency)}
      />
    </ChartCard>
  )
}
