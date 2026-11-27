'use client'

import { ChartCard, chartColor, ColumnChart } from '@/shared/ui/dashboard'
import type { StaffByAppVersionDto } from '../../model/dashboard-staff-access.dto'

// Versión del app: sirve para saber si alguien sigue usando una versión antigua.
export function AppVersionChart({ data }: { data: StaffByAppVersionDto[] | undefined }) {
  const rows = data ?? []

  return (
    <ChartCard
      title='Por versión del app'
      description='Versión del cliente usada al iniciar sesión'
      isLoading={!data}
      isEmpty={rows.every((r) => r.count === 0)}
    >
      <ColumnChart
        data={rows.map((r) => ({ label: r.version || 'Sin versión', value: r.count }))}
        seriesLabel='Logins'
        xAxisLabel='Versión'
        yAxisLabel='Logins'
        color={chartColor(6)}
      />
    </ChartCard>
  )
}
