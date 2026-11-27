'use client'

import { ChartCard, DonutChart, formatNumber } from '@/shared/ui/dashboard'
import { useReportHref } from '../../lib/use-report-href'
import type { ContactByStatusDto } from '../../model/dashboard-messages.dto'

export function ContactStatusDonut({ data }: { data: ContactByStatusDto[] | undefined }) {
  // Botón ↗ "Ver en reportes" con el mismo periodo y moneda del dashboard.
  const reportHref = useReportHref('mensajes')
  const rows = data ?? []
  const total = rows.reduce((sum, r) => sum + r.count, 0)

  return (
    <ChartCard
      href={reportHref}
      title='Mensajes por estado'
      description='Nuevos, atendidos y descartados'
      isLoading={!data}
      isEmpty={total === 0}
    >
      <DonutChart
        data={rows.map((r) => ({ label: r.label, value: r.count }))}
        valueFormatter={(v) => `${formatNumber(v)} mensajes`}
        centerValue={formatNumber(total)}
        centerLabel='mensajes'
      />
    </ChartCard>
  )
}
