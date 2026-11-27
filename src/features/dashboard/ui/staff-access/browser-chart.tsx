'use client'

import { BarListChart, ChartCard, chartColor } from '@/shared/ui/dashboard'
import type { StaffByBrowserDto } from '../../model/dashboard-staff-access.dto'

export function BrowserChart({ data }: { data: StaffByBrowserDto[] | undefined }) {
  const rows = data ?? []

  return (
    <ChartCard
      title='Por navegador'
      description='Navegador detectado en los logins web'
      isLoading={!data}
      isEmpty={rows.every((r) => r.count === 0)}
    >
      <BarListChart
        data={rows.map((r) => ({ label: r.browser || 'Desconocido', value: r.count }))}
        seriesLabel='Logins'
        axisLabel='Logins'
        color={chartColor(2)}
      />
    </ChartCard>
  )
}
