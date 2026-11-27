'use client'

// Botones de solo icono junto a los filtros de un listado:
// - Limpiar: deja los filtros vacíos (deshabilitado si no hay ninguno puesto).
// - Refrescar: vuelve a pedir la lista con los filtros y la página actuales.

import { FilterX, RefreshCw } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { cn } from '@/shared/lib/utils'

interface DataTableFilterActionsProps {
  onClear: () => void
  onRefresh: () => void
  /** true si hay al menos un filtro puesto (habilita "Limpiar"). */
  hasActiveFilters: boolean
  /** true mientras se pide la lista (deshabilita ambos botones y hace girar el de refrescar). */
  isFetching?: boolean
  className?: string
}

export function DataTableFilterActions({
  onClear,
  onRefresh,
  hasActiveFilters,
  isFetching = false,
  className,
}: DataTableFilterActionsProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* span: el tooltip debe verse aunque el botón esté deshabilitado */}
          <span tabIndex={hasActiveFilters ? -1 : 0}>
            <Button
              variant="outline"
              size="icon"
              disabled={isFetching || !hasActiveFilters}
              onClick={onClear}
              className="size-8"
            >
              <FilterX className="size-4" />
              <span className="sr-only">Limpiar filtros</span>
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>{hasActiveFilters ? 'Limpiar filtros' : 'No hay filtros aplicados'}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            disabled={isFetching}
            onClick={onRefresh}
            className="size-8"
          >
            <RefreshCw className={cn('size-4', isFetching && 'animate-spin')} />
            <span className="sr-only">Refrescar</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Refrescar</TooltipContent>
      </Tooltip>
    </div>
  )
}
