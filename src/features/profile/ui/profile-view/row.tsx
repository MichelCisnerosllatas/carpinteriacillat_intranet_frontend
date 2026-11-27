'use client'

import { type ReactNode } from 'react'

/** Fila "etiqueta ...... valor" de la vista de lectura. */
export function Row({ label, value, icon }: { label: string; value: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="text-end font-medium break-all">{value || '—'}</span>
    </div>
  )
}
