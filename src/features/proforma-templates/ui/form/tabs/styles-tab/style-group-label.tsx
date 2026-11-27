'use client'

import type { ReactNode } from 'react'
import { Separator } from '@/shared/ui/separator'

// Subtítulo de agrupación dentro de cada acordeón (Colores / Tipografía y diseño / Medidas):
// separa visualmente campos que antes iban todos seguidos, para que el usuario no tenga que
// leer cada label para saber en qué grupo está.
export function StyleGroupLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground shrink-0 text-xs font-semibold tracking-wide uppercase">
        {children}
      </span>
      <Separator className="flex-1" />
    </div>
  )
}
