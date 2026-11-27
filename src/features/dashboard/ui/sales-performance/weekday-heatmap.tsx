'use client'

import { cn } from '@/shared/lib/utils'
import { useReportHref } from '../../lib/use-report-href'
import { ChartCard, formatMoney, formatNumber, type Currency } from '@/shared/ui/dashboard'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import type { SalesWeekdayHeatmapDto } from '../../model/dashboard-sales-performance.dto'

type Props = {
  data: SalesWeekdayHeatmapDto[] | undefined
  currency: Currency
}

// 5 niveles de intensidad de un mismo color (escala secuencial: más oscuro = más ventas).
// Clases fijas porque Tailwind no reconoce clases armadas con variables en tiempo de ejecución.
const LEVEL_CLASSES = ['bg-muted', 'bg-chart-1/20', 'bg-chart-1/40', 'bg-chart-1/65', 'bg-chart-1/90']

function getLevel(value: number, max: number): number {
  if (value <= 0 || max <= 0) return 0
  return Math.min(4, Math.ceil((value / max) * 4))
}

// Mapa de calor día de la semana × mes: ayuda a ver qué días se vende más (ej. sábados).
// Hecho con divs y no con recharts porque recharts no trae heatmap.
export function WeekdayHeatmap({ data, currency }: Props) {
  // Botón ↗ "Ver en reportes" con el mismo periodo y moneda del dashboard.
  const reportHref = useReportHref('ventas')
  const rows = data ?? []

  // Meses (columnas) en el orden en que llegan y días (filas) de Lunes a Domingo.
  const months = Array.from(new Map(rows.map((r) => [r.month, r.month_label])).entries()).sort(([a], [b]) =>
    a.localeCompare(b)
  )
  const weekdays = Array.from(new Map(rows.map((r) => [r.weekday, r.weekday_label])).entries()).sort(
    ([a], [b]) => a - b
  )
  const findCell = (weekday: number, month: string) => rows.find((r) => r.weekday === weekday && r.month === month)
  const max = Math.max(0, ...rows.map((r) => r.total))

  return (
    <ChartCard
      href={reportHref}
      title='Ventas por día de la semana'
      description='Últimos 6 meses · color más intenso = más monto vendido'
      isLoading={!data}
      isEmpty={max === 0}
    >
      <div className='flex flex-col gap-1.5'>
        {/* Encabezado de meses */}
        <div className='flex gap-1.5 pl-10'>
          {months.map(([month, label]) => (
            <span key={month} className='text-muted-foreground flex-1 truncate text-center text-[11px]'>
              {label}
            </span>
          ))}
        </div>

        {weekdays.map(([weekday, weekdayLabel]) => (
          <div key={weekday} className='flex items-center gap-1.5'>
            <span className='text-muted-foreground w-8.5 shrink-0 text-xs'>{weekdayLabel}</span>
            {months.map(([month, monthLabel]) => {
              const cell = findCell(weekday, month)
              const level = getLevel(cell?.total ?? 0, max)
              return (
                <Tooltip key={month}>
                  <TooltipTrigger asChild>
                    <button
                      type='button'
                      aria-label={`${weekdayLabel} de ${monthLabel}`}
                      className={cn(
                        'hover:ring-foreground/40 h-8 flex-1 rounded-md transition-shadow hover:ring-2',
                        LEVEL_CLASSES[level]
                      )}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className='font-medium'>
                      {weekdayLabel} · {monthLabel}
                    </p>
                    <p>{formatMoney(cell?.total ?? 0, currency)}</p>
                    <p className='opacity-80'>{formatNumber(cell?.count ?? 0)} ventas</p>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        ))}

        {/* Leyenda de la escala */}
        <div className='text-muted-foreground mt-2 flex items-center justify-end gap-1.5 text-[11px]'>
          <span>Menos</span>
          {LEVEL_CLASSES.map((cls) => (
            <span key={cls} className={cn('h-3 w-3 rounded-sm', cls)} />
          ))}
          <span>Más</span>
        </div>
      </div>
    </ChartCard>
  )
}
