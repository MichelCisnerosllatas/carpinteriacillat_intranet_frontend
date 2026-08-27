'use client'

import { cn } from '@/shared/lib/utils'

type TableLoadingBarProps = {
  /** Muestra la barra. Se recomienda activarla solo en recargas disparadas por el usuario (filtros, búsqueda, paginación) — no en la carga automática al entrar al módulo. */
  active: boolean
  className?: string
}

/**
 * Indicador de "actualizando" para tablas: una barra horizontal delgada,
 * pegada al borde superior del contenedor `relative` de la tabla, con un
 * barrido indeterminado. Reemplaza al pill "Actualizando..." — no tapa
 * contenido, no tiene texto, y desaparece sola al terminar el fetch.
 */
export function TableLoadingBar({ active, className }: TableLoadingBarProps) {
  if (!active) return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Actualizando"
      className={cn(
        'pointer-events-none absolute inset-x-0 top-0 z-20 h-0.5 overflow-hidden rounded-full bg-primary/15',
        className
      )}
    >
      <div className="h-full w-1/3 -translate-x-full animate-[shimmer_1.1s_ease-in-out_infinite] rounded-full bg-primary" />
    </div>
  )
}
