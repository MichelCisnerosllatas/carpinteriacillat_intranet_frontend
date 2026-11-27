'use client'

import { BarListChart, ChartCard, chartColor, formatMoney, type Currency } from '@/shared/ui/dashboard'
import { useReportHref } from '../../lib/use-report-href'
import type { ProformasTopClientDto } from '../../model/dashboard-proformas.dto'

type Props = {
  data: ProformasTopClientDto[] | undefined
  currency: Currency
}

export function ProformasTopClientsChart({ data, currency }: Props) {
  // Botón ↗ "Ver en reportes" con el mismo periodo y moneda del dashboard.
  const reportHref = useReportHref('proformas')
  // Top 5 en el dashboard; el top 10 completo está en Reportes (botón ↗).
  const rows = (data ?? []).slice(0, 5)

  return (
    <ChartCard
      href={reportHref}
      title='Clientes más cotizados'
      description='Top 5 por monto cotizado en el periodo'
      isLoading={!data}
      isEmpty={rows.length === 0}
    >
      <BarListChart
        data={rows.map((r) => ({ label: r.client_name, value: r.total }))}
        seriesLabel='Monto cotizado'
        valueFormatter={(v) => formatMoney(v, currency)}
        axisFormatter={(v) => formatMoney(v, currency, { compact: true })}
        axisLabel={`Monto (${currency})`}
        color={chartColor(0)}
      />
    </ChartCard>
  )
}
