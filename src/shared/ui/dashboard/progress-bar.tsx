'use client'

import { cn } from '@/shared/lib/utils'

type ProgressBarProps = {
  /** Porcentaje 0..100 (se recorta si se pasa de 100, ej. una meta superada). */
  value: number | null | undefined
  className?: string
}

// Barra de progreso simple (no hay componente Progress de shadcn instalado en el proyecto).
export function ProgressBar({ value, className }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, Number(value ?? 0)))
  const reached = Number(value ?? 0) >= 100

  return (
    <div
      role='progressbar'
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      className={cn('bg-muted h-2 w-full overflow-hidden rounded-full', className)}
    >
      <div
        className={cn(
          'h-full w-(--progress) rounded-full transition-[width] duration-700 ease-out',
          reached ? 'bg-emerald-500' : 'bg-primary'
        )}
        style={{ ['--progress' as string]: `${pct}%` }}
      />
    </div>
  )
}
