'use client'

import type { ReactNode } from 'react'
import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

/**
 * Etiqueta de campo + ícono de ayuda con tooltip. Pensado para usarse dentro de `FormLabel`/`Label`
 * cuando el nombre del campo no basta para que un usuario sin conocimiento técnico entienda qué hace
 * (ver `ColumnHeadTip` en `features/proformas` para el equivalente en encabezados de tabla).
 *
 * El ícono es un `<button>` (no un ícono suelto) para que la ayuda también se pueda abrir con el
 * teclado (Tab) y con un toque en celular. `type="button"` evita que envíe el formulario, y al
 * ser contenido interactivo, tocarlo dentro de un `<label>` no activa el campo de esa etiqueta.
 */
export function FieldTip({ label, tip }: { label: ReactNode; tip: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      {label}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={`Ayuda: ${tip}`}
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex shrink-0 items-center justify-center rounded-full p-0.5 transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <Info className="size-3" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">{tip}</TooltipContent>
      </Tooltip>
    </span>
  )
}
