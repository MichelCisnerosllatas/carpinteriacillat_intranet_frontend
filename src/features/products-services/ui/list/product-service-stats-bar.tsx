'use client'

import { cn } from '@/shared/lib/utils'

interface ProductServiceStatsBarProps {
  total: number
  products: number
  services: number
  active: number
}

export function ProductServiceStatsBar({ total, products, services, active }: ProductServiceStatsBarProps) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {[
        { label: 'Total',     value: total,    color: 'text-foreground' },
        { label: 'Productos', value: products, color: 'text-sky-600 dark:text-sky-400' },
        { label: 'Servicios', value: services, color: 'text-violet-600 dark:text-violet-400' },
        { label: 'Activos',   value: active,   color: 'text-teal-600 dark:text-teal-400' },
      ].map(({ label, value, color }) => (
        <div key={label} className="flex flex-col items-center rounded-lg border bg-background p-3">
          <span className={cn('text-2xl font-bold tabular-nums', color)}>{value}</span>
          <span className="mt-0.5 text-xs text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  )
}
