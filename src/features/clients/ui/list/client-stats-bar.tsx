'use client'

import { cn } from '@/shared/lib/utils'

interface ClientStatsBarProps {
  total: number
  active: number
  inactive: number
}

export function ClientStatsBar({ total, active, inactive }: ClientStatsBarProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { label: 'Clientes',  value: total,    color: 'text-foreground' },
        { label: 'Activos',   value: active,   color: 'text-teal-600 dark:text-teal-400' },
        { label: 'Inactivos', value: inactive, color: 'text-neutral-500' },
      ].map(({ label, value, color }) => (
        <div key={label} className="flex flex-col items-center rounded-lg border bg-background p-3">
          <span className={cn('text-2xl font-bold tabular-nums', color)}>{value}</span>
          <span className="mt-0.5 text-xs text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  )
}
