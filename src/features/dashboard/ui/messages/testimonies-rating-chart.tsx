'use client'

import { ChartCard, chartColor, ColumnChart, formatNumber, GaugeChart } from '@/shared/ui/dashboard'
import type { TestimoniesByRatingDto } from '../../model/dashboard-messages.dto'

type Props = {
  data: TestimoniesByRatingDto[] | undefined
  average: number | null | undefined
}

// Distribución de estrellas (barras) + promedio general (medidor sobre 5 estrellas).
export function TestimoniesRatingChart({ data, average }: Props) {
  const rows = [...(data ?? [])].sort((a, b) => a.rating - b.rating)
  const total = rows.reduce((sum, r) => sum + r.count, 0)
  // El medidor trabaja en %: 4.5 estrellas de 5 = 90 %.
  const averagePct = average != null ? (average / 5) * 100 : null

  return (
    <ChartCard
      title='Opiniones de clientes'
      description='Testimonios del periodo según su calificación'
      isLoading={!data}
      isEmpty={total === 0}
      emptyMessage='No hay testimonios en el periodo.'
      footer={`${formatNumber(total)} testimonios calificados`}
    >
      <div className='grid grid-cols-1 items-center gap-4 md:grid-cols-5'>
        <div className='md:col-span-2'>
          <GaugeChart
            value={averagePct}
            centerValue={average != null ? formatNumber(average, 1) : '—'}
            centerLabel='promedio de 5'
            seriesLabel='Promedio'
            color={chartColor(3)}
          />
        </div>
        <div className='min-w-0 md:col-span-3'>
          <ColumnChart
            data={rows.map((r) => ({ label: `${r.rating} ★`, value: r.count }))}
            seriesLabel='Testimonios'
            yAxisLabel='Cantidad'
            color={chartColor(3)}
            className='h-[240px]'
          />
        </div>
      </div>
    </ChartCard>
  )
}
