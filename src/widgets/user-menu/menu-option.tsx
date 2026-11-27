'use client'

import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

/** Una opción del menú: icono en un cuadrito + título + texto de ayuda pequeño. */
export function MenuOption({
  icon,
  title,
  hint,
  danger = false,
}: {
  icon: ReactNode
  title: string
  hint?: string
  danger?: boolean
}) {
  return (
    <span className="flex w-full items-center gap-3">
      <span
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-md [&_svg]:size-4',
          danger ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
        )}
      >
        {icon}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-sm font-medium">{title}</span>
        {hint && <span className="truncate text-xs text-muted-foreground">{hint}</span>}
      </span>
    </span>
  )
}
