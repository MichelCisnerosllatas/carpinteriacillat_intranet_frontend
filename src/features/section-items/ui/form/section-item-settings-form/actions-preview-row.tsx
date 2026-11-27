'use client'

import { CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

/** Fila "Agregar/Reordenar/Eliminar" de la vista previa. */
export function ActionsPreviewRow({ label, add, reorder, del, tabVisible }: { label: string; add: boolean; reorder: boolean; del: boolean; tabVisible: boolean }) {
  if (!tabVisible) {
    return (
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-muted-foreground/50">{label}</span>
        <span className="text-xs text-muted-foreground/50">tab oculto — no aplica</span>
      </div>
    )
  }
  const items: [string, boolean][] = [['Agregar', add], ['Reordenar', reorder], ['Eliminar', del]]
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="font-medium">{label}</span>
      <div className="flex items-center gap-3">
        {items.map(([actionLabel, on]) => (
          <span key={actionLabel} className={cn('flex items-center gap-1 text-xs', on ? 'text-foreground' : 'text-muted-foreground/60')}>
            {on ? <CheckCircle2 className="size-3.5 text-emerald-600" /> : <XCircle className="size-3.5 text-muted-foreground/50" />}
            {actionLabel}
          </span>
        ))}
      </div>
    </div>
  )
}
