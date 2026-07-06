'use client'

import { cn } from '@/shared/lib/utils'

interface ProformaTemplateStatsBarProps {
  total: number
  active: number
  inactive: number
}

export function ProformaTemplateStatsBar({
  total,
  active,
  inactive,
}: ProformaTemplateStatsBarProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { label: 'Plantillas', value: total, color: 'text-foreground' },
        { label: 'Activas', value: active, color: 'text-teal-600 dark:text-teal-400' },
        { label: 'Inactivas', value: inactive, color: 'text-neutral-500' },
      ].map(({ label, value, color }) => (
        <div key={label} className="bg-background flex flex-col items-center rounded-lg border p-3">
          <span className={cn('text-2xl font-bold tabular-nums', color)}>{value}</span>
          <span className="text-muted-foreground mt-0.5 text-xs">{label}</span>
        </div>
      ))}
    </div>
  )
}
