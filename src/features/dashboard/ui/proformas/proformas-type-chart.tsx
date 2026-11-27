'use client'

import { ChartCard, chartColor, ColumnChart, formatNumber } from '@/shared/ui/dashboard'
import { useReportHref } from '../../lib/use-report-href'
import type { ProformasByTypeDto } from '../../model/dashboard-proformas.dto'

type Props = {
  data: ProformasByTypeDto[] | undefined
}

export function ProformasTypeChart({ data }: Props) {
  // Botón ↗ "Ver en reportes" con el mismo periodo y moneda del dashboard.
  const reportHref = useReportHref('proformas')
  const rows = data ?? []

  return (
    <ChartCard
      href={reportHref}
      title='Proformas por tipo'
      description='Cantidad según el tipo de proforma'
      isLoading={!data}
      isEmpty={rows.every((r) => r.count === 0)}
    >
      <ColumnChart
        data={rows.map((r) => ({ label: r.name, value: r.count }))}
        seriesLabel='Proformas'
        valueFormatter={(v) => formatNumber(v)}
        xAxisLabel='Tipo de proforma'
        yAxisLabel='Cantidad'
        color={chartColor(6)}
      />
    </ChartCard>
  )
}
