'use client'

import { cn } from '@/shared/lib/utils'

/** Chip de la vista previa — pinta como quedaría el tab en el detalle real (ver section-item-detail.tsx: TabsTrigger). Gris/tachado cuando ese tab está oculto. */
export function TabPreviewChip({ label, visible }: { label: string; visible: boolean }) {
  return (
    <span className={cn(
      'rounded-md border px-3 py-1.5 text-xs font-medium',
      visible ? 'border-border bg-background text-foreground' : 'border-dashed border-muted-foreground/30 text-muted-foreground/50 line-through'
    )}>
      {label}
    </span>
  )
}
