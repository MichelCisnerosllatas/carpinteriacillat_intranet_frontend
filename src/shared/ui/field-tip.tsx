'use client'

import type { ReactNode } from 'react'
import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

/**
 * Etiqueta de campo + ícono de ayuda con tooltip. Pensado para usarse dentro de `FormLabel`/`Label`
 * cuando el nombre del campo no basta para que un usuario sin conocimiento técnico entienda qué hace
 * (ver `ColumnHeadTip` en `features/proformas` para el equivalente en encabezados de tabla).
 */
export function FieldTip({ label, tip }: { label: ReactNode; tip: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      {label}
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="text-muted-foreground size-3 shrink-0" />
        </TooltipTrigger>
        <TooltipContent>{tip}</TooltipContent>
      </Tooltip>
    </span>
  )
}
