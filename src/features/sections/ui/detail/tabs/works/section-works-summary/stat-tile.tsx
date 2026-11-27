'use client'

import { Eye } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

export function StatTile({ icon: Icon, label, value, className }: { icon: typeof Eye; label: string; value: number; className?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 shadow-sm">
      <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground', className)}>
        <Icon className="size-4" />
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-bold tabular-nums leading-tight">{value}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  )
}
