'use client'

import { BarListChart, ChartCard, chartColor, ColumnChart, DonutChart, formatNumber } from '@/shared/ui/dashboard'
import type {
  GoogleRequestsByStatusDto,
  StaffByAppVersionDto,
  StaffByBrowserDto,
  StaffByPlatformDto,
} from '../../model/dashboard-staff-access.dto'

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
