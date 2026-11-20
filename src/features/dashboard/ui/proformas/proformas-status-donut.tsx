'use client'

import { ChartCard, DonutChart, formatNumber } from '@/shared/ui/dashboard'
import { useReportHref } from '../../lib/use-report-href'
import type { ProformasByStatusDto } from '../../model/dashboard-proformas.dto'

type Props = {
  data: ProformasByStatusDto[] | undefined
}

// Las "Vencidas" incluyen las pendientes cuya fecha de vencimiento ya pasó (lo calcula el backend).
export function ProformasStatusDonut({ data }: Props) {
  // Botón ↗ "Ver en reportes" con el mismo periodo y moneda del dashboard.
  const reportHref = useReportHref('proformas')
  const rows = data ?? []
  const count = rows.reduce((sum, r) => sum + r.count, 0)

  return (
    <ChartCard
      href={reportHref}
      title='Proformas por estado'
      description='Cantidad de proformas del periodo en cada estado'
      isLoading={!data}
      isEmpty={count === 0}
    >
      <DonutChart
        data={rows.map((r) => ({ label: r.label, value: r.count }))}
        valueFormatter={(v) => `${formatNumber(v)} proformas`}
        centerValue={formatNumber(count)}
        centerLabel='proformas'
      />
    </ChartCard>
  )
}
