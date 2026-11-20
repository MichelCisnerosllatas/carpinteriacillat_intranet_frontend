'use client'

import { ChartCard, chartColor, ColumnChart, formatMoney, formatNumber, type Currency } from '@/shared/ui/dashboard'
import { useReportHref } from '../../lib/use-report-href'
import type { SalesReceivablesDto } from '../../model/dashboard-sales-performance.dto'

type Props = {
  receivables: SalesReceivablesDto | undefined
  currency: Currency
}

// Antigüedad de la deuda: mientras más a la derecha esté el monto, más difícil será cobrarlo.
export function ReceivablesAgingChart({ receivables, currency }: Props) {
  // Botón ↗ "Ver en reportes" con el mismo periodo y moneda del dashboard.
  const reportHref = useReportHref('pagos', 'saldos')
  const aging = receivables?.aging ?? []
  const count = aging.reduce((sum, a) => sum + a.count, 0)

  return (
    <ChartCard
      href={reportHref}
      title='Antigüedad de la deuda'
      description={`Saldo pendiente total: ${formatMoney(receivables?.total ?? 0, currency)}`}
      isLoading={!receivables}
      isEmpty={aging.every((a) => a.total === 0)}
      emptyMessage='No hay saldos pendientes de cobro.'
      footer={`${formatNumber(count)} ventas con saldo, agrupadas por días desde su emisión`}
    >
      <ColumnChart
        data={aging.map((a) => ({ label: a.label, value: a.total }))}
        seriesLabel='Saldo pendiente'
        valueFormatter={(v) => formatMoney(v, currency)}
        axisFormatter={(v) => formatMoney(v, currency, { compact: true })}
        xAxisLabel='Días desde la emisión'
        yAxisLabel={`Saldo (${currency})`}
        color={chartColor(1)}
      />
    </ChartCard>
  )
}
