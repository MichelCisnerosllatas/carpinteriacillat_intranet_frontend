'use client'

import { ChartCard, DonutChart, formatNumber } from '@/shared/ui/dashboard'
import { useReportHref } from '../../lib/use-report-href'
import type { ContactByProjectTypeDto } from '../../model/dashboard-messages.dto'

// Qué tipo de proyecto pide más la gente desde el formulario del sitio (cocina, clóset, etc.).
export function ContactProjectTypePie({ data }: { data: ContactByProjectTypeDto[] | undefined }) {
  // Botón ↗ "Ver en reportes" con el mismo periodo y moneda del dashboard.
  const reportHref = useReportHref('mensajes')
  const rows = data ?? []

  return (
    <ChartCard
      href={reportHref}
      title='Por tipo de proyecto'
      description='Mensajes de contacto según el proyecto solicitado'
      isLoading={!data}
      isEmpty={rows.every((r) => r.count === 0)}
    >
      <DonutChart
        variant='pie'
        data={rows.map((r) => ({ label: r.label, value: r.count }))}
        valueFormatter={(v) => `${formatNumber(v)} mensajes`}
      />
    </ChartCard>
  )
}
