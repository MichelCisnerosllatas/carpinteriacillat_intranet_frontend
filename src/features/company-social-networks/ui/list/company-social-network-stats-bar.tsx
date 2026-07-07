'use client'

import { cn } from '@/shared/lib/utils'

interface CompanySocialNetworkStatsBarProps {
  total: number
  active: number
  onWebsite: number
}

export function CompanySocialNetworkStatsBar({ total, active, onWebsite }: CompanySocialNetworkStatsBarProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { label: 'Redes sociales', value: total, color: 'text-foreground' },
        { label: 'Activas', value: active, color: 'text-teal-600 dark:text-teal-400' },
        { label: 'En el sitio web', value: onWebsite, color: 'text-blue-600 dark:text-blue-400' },
      ].map(({ label, value, color }) => (
        <div key={label} className="flex flex-col items-center rounded-lg border bg-background p-3">
          <span className={cn('text-2xl font-bold tabular-nums', color)}>{value}</span>
          <span className="mt-0.5 text-xs text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  )
}
