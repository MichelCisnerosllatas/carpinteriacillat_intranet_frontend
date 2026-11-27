'use client'

import { ChartCard, DonutChart, formatNumber } from '@/shared/ui/dashboard'
import type { GoogleRequestsByStatusDto } from '../../model/dashboard-staff-access.dto'

export function GoogleRequestsDonut({ data }: { data: GoogleRequestsByStatusDto[] | undefined }) {
  const rows = data ?? []
  const total = rows.reduce((sum, r) => sum + r.count, 0)

  return (
    <ChartCard
      title='Solicitudes de acceso con Google'
      description='Correos que pidieron acceso, según su estado'
      isLoading={!data}
      isEmpty={total === 0}
      emptyMessage='No hay solicitudes en el periodo.'
    >
      <DonutChart
        data={rows.map((r) => ({ label: r.label, value: r.count }))}
        valueFormatter={(v) => `${formatNumber(v)} solicitudes`}
        centerValue={formatNumber(total)}
        centerLabel='solicitudes'
      />
    </ChartCard>
  )
}
