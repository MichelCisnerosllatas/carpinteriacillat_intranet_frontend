'use client'

import { ChartCard, DonutChart, formatMoney, formatNumber, type Currency } from '@/shared/ui/dashboard'
import { useReportHref } from '../../lib/use-report-href'
import type { SummaryPaymentStatusDto } from '../../model/dashboard-summary.dto'

type Props = {
  data: SummaryPaymentStatusDto[] | undefined
  currency: Currency
}

// Cuánto de lo vendido en el periodo está pagado, parcial o pendiente.
export function PaymentStatusDonut({ data, currency }: Props) {
  // Botón ↗ "Ver en reportes" con el mismo periodo y moneda del dashboard.
  const reportHref = useReportHref('ventas')
  const rows = data ?? []
  const total = rows.reduce((sum, r) => sum + r.total, 0)
  const count = rows.reduce((sum, r) => sum + r.count, 0)

  return (
    <ChartCard
      href={reportHref}
      title='Estado de pago'
      description='Ventas no anuladas del periodo según su cobro'
      isLoading={!data}
      isEmpty={total === 0}
      footer={`${formatNumber(count)} ventas en total`}
    >
      <DonutChart
        data={rows.map((r) => ({ label: r.label, value: r.total }))}
        valueFormatter={(v) => formatMoney(v, currency)}
        centerValue={formatMoney(total, currency, { compact: true })}
        centerLabel='Total vendido'
      />
    </ChartCard>
  )
}
