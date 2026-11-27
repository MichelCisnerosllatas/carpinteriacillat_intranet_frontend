'use client'

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/shared/ui/chart'
import { ChartCard, chartColor, formatNumber, tooltipFormatter } from '@/shared/ui/dashboard'
import type { StaffDailyLoginsDto } from '../../model/dashboard-staff-access.dto'

const config: ChartConfig = { logins: { label: 'Inicios de sesión', color: chartColor(0) } }

export function LoginsDailyLineChart({ data }: { data: StaffDailyLoginsDto[] | undefined }) {
  const rows = data ?? []

  return (
    <ChartCard
      title='Inicios de sesión por día'
      description='Ingresos del personal a la intranet y al app'
      isLoading={!data}
      isEmpty={rows.every((r) => r.logins === 0)}
    >
      <ChartContainer config={config} className='aspect-auto h-[300px] w-full'>
        <LineChart data={rows} margin={{ top: 12, right: 12, left: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray='3 3' />
          <XAxis dataKey='label' tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={52}
            allowDecimals={false}
            label={{ value: 'Logins', angle: -90, position: 'insideLeft', className: 'fill-muted-foreground text-xs' }}
          />
          <ChartTooltip content={<ChartTooltipContent indicator='line' formatter={tooltipFormatter((v) => formatNumber(v), { logins: 'Inicios de sesión' })} />} />
          {/* Sin puntos fijos: con 90 días serían demasiados; el punto aparece al pasar el mouse. */}
          <Line dataKey='logins' type='monotone' stroke='var(--color-logins)' strokeWidth={2} dot={false} activeDot={{ r: 5 }} animationDuration={900} />
        </LineChart>
      </ChartContainer>
    </ChartCard>
  )
}
