'use client'

import type { ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Card } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { formatPercent } from './format'
import { ProgressBar } from './progress-bar'

type KpiCardProps = {
  title: string
  /** Valor YA formateado (ej. "S/ 12,500.00"), así la tarjeta no necesita saber la moneda. */
  value: string
  icon: LucideIcon
  /** Variación en % respecto a otro periodo. null = no hay base para comparar. */
  changePct?: number | null
  changeLabel?: string
  /** true cuando subir es MALO (ej. ventas anuladas): invierte los colores de la flecha. */
  invertChange?: boolean
  description?: ReactNode
  /** Si se envía, muestra una barra de progreso (ej. avance de meta). */
  progress?: number | null
  isLoading?: boolean
  className?: string
}

export function KpiCard({
  title,
  value,
  icon: Icon,
  changePct,
  changeLabel = 'vs periodo anterior',
  invertChange = false,
  description,
  progress,
  isLoading = false,
  className,
}: KpiCardProps) {
  if (isLoading) {
    return (
      <Card className={cn('gap-3 p-4', className)}>
        <Skeleton className='h-4 w-28' />
        <Skeleton className='h-7 w-36' />
        <Skeleton className='h-3 w-24' />
      </Card>
    )
  }

  return (
    <Card className={cn('min-w-0 gap-2 p-4', className)}>
      <div className='flex items-start justify-between gap-2'>
        <p className='text-muted-foreground text-sm font-medium'>{title}</p>
        <span className='bg-accent-warm text-accent-warm-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-lg'>
          <Icon className='h-4 w-4' />
        </span>
      </div>

      <p className='truncate text-2xl font-bold tracking-tight tabular-nums' title={value}>
        {value}
      </p>

      {changePct !== undefined && (
        <ChangeIndicator value={changePct} label={changeLabel} invert={invertChange} />
      )}

      {progress !== undefined && <ProgressBar value={progress} className='mt-1' />}

      {description && <p className='text-muted-foreground text-xs'>{description}</p>}
    </Card>
  )
}

// La flecha + texto acompañan al color: así la variación se entiende aunque no se distinga el color.
function ChangeIndicator({ value, label, invert }: { value: number | null; label: string; invert: boolean }) {
  if (value === null) {
    return (
      <p className='text-muted-foreground flex items-center gap-1 text-xs'>
        <Minus className='h-3.5 w-3.5' /> Sin datos para comparar
      </p>
    )
  }

  const isUp = value > 0
  const isFlat = value === 0
  const isGood = invert ? !isUp : isUp
  const Arrow = isFlat ? Minus : isUp ? ArrowUpRight : ArrowDownRight

  return (
    <p className='flex flex-wrap items-center gap-1 text-xs'>
      <span
        className={cn(
          'inline-flex items-center gap-0.5 font-semibold',
          isFlat
            ? 'text-muted-foreground'
            : isGood
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-red-600 dark:text-red-400'
        )}
      >
        <Arrow className='h-3.5 w-3.5' />
        {formatPercent(value, { signed: true })}
      </span>
      <span className='text-muted-foreground'>{label}</span>
    </p>
  )
}
