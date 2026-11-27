'use client'

import { Label, PolarAngleAxis, PolarRadiusAxis, RadialBar, RadialBarChart } from 'recharts'
import { cn } from '@/shared/lib/utils'
import { ChartContainer, type ChartConfig } from '@/shared/ui/chart'
import { chartColor } from '../chart-colors'

type GaugeChartProps = {
  /** Porcentaje 0..100 (si supera 100 el arco se dibuja lleno). */
  value: number | null
  centerValue: string
  centerLabel?: string
  seriesLabel?: string
  color?: string
  className?: string
}

// Medidor semicircular (tipo velocímetro) hecho con RadialBarChart.
// Se usa para "avance de meta" y "promedio de estrellas".
export function GaugeChart({
  value,
  centerValue,
  centerLabel,
  seriesLabel = 'Avance',
  color = chartColor(0),
  className,
}: GaugeChartProps) {
  const config: ChartConfig = { progress: { label: seriesLabel, color } }
  const pct = Math.max(0, Math.min(100, Number(value ?? 0)))
  const data = [{ name: 'progress', value: pct, fill: 'var(--color-progress)' }]

  return (
    <ChartContainer config={config} className={cn('mx-auto aspect-[2/1.25] w-full max-w-[320px]', className)}>
      {/* startAngle 180 → endAngle 0 dibuja solo la mitad superior del círculo. */}
      <RadialBarChart data={data} startAngle={180} endAngle={0} innerRadius='75%' outerRadius='120%' cy='75%'>
        {/* Dominio fijo 0..100 para que el arco represente un porcentaje real del semicírculo. */}
        <PolarAngleAxis type='number' domain={[0, 100]} tick={false} axisLine={false} />
        <RadialBar dataKey='value' background cornerRadius={8} animationDuration={900} />
        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
          <Label
            content={({ viewBox }) => {
              if (!viewBox || !('cx' in viewBox) || !('cy' in viewBox)) return null
              const cx = Number(viewBox.cx)
              const cy = Number(viewBox.cy)
              return (
                <text x={cx} y={cy} textAnchor='middle'>
                  <tspan x={cx} y={cy - 18} className='fill-foreground text-2xl font-bold'>
                    {centerValue}
                  </tspan>
                  {centerLabel && (
                    <tspan x={cx} y={cy + 2} className='fill-muted-foreground text-xs'>
                      {centerLabel}
                    </tspan>
                  )}
                </text>
              )
            }}
          />
        </PolarRadiusAxis>
      </RadialBarChart>
    </ChartContainer>
  )
}
