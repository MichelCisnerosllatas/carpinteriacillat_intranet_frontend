'use client'

import { cn } from '@/shared/lib/utils'

interface ContactMessageStatsBarProps {
  total: number
  nuevo: number
  atendido: number
  descartado: number
}

export function ContactMessageStatsBar({ total, nuevo, atendido, descartado }: ContactMessageStatsBarProps) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {[
        { label: 'Mensajes',   value: total,      color: 'text-foreground' },
        { label: 'Nuevos',     value: nuevo,      color: 'text-amber-600 dark:text-amber-400' },
        { label: 'Atendidos',  value: atendido,   color: 'text-teal-600 dark:text-teal-400' },
        { label: 'Descartados', value: descartado, color: 'text-neutral-500' },
      ].map(({ label, value, color }) => (
        <div key={label} className="flex flex-col items-center rounded-lg border bg-background p-3">
          <span className={cn('text-2xl font-bold tabular-nums', color)}>{value}</span>
          <span className="mt-0.5 text-xs text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  )
}
