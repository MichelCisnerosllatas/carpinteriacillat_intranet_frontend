// src/features/proformas/ui/form/column-head-tip.tsx
'use client'

import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

/**
 * Tooltip en el encabezado de columna (una sola vez) en vez de repetirlo en cada input de cada
 * fila — explica lo mismo sin saturar la tabla con un ícono por celda.
 */
export function ColumnHeadTip({ label, tip }: { label: string; tip: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      {label}
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="size-3 text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent>{tip}</TooltipContent>
      </Tooltip>
    </span>
  )
}
