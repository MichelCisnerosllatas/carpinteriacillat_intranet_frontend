'use client'

import { ChartCard, DonutChart, formatNumber } from '@/shared/ui/dashboard'
import type { StaffByPlatformDto } from '../../model/dashboard-staff-access.dto'

const count = (v: number) => `${formatNumber(v)} logins`

export function PlatformDonut({ data }: { data: StaffByPlatformDto[] | undefined }) {
  const rows = data ?? []
  const total = rows.reduce((sum, r) => sum + r.count, 0)

  return (
    <ChartCard title='Por plataforma' description='Web, Android, iOS…' isLoading={!data} isEmpty={total === 0}>
      <DonutChart
        data={rows.map((r) => ({ label: r.label, value: r.count }))}
        valueFormatter={count}
        centerValue={formatNumber(total)}
        centerLabel='logins'
      />
    </ChartCard>
  )
}
