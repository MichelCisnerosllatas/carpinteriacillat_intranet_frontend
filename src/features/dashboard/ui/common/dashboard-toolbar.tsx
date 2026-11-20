'use client'

import { AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import { IconButton } from '@/shared/ui/icon-button'
import { DashboardFilters } from '@/shared/ui/dashboard'
import { useDashboardFiltersStore } from '../../stores/useDashboardFiltersStore'

type DashboardToolbarProps = {
  isFetching: boolean
  onRefresh: () => void
  /** Error de una recarga cuando YA había datos en pantalla (se avisa sin borrar los gráficos). */
  errorMessage?: string | null
  showCurrency?: boolean
}

// Barra de filtros conectada al store compartido de dashboards.
export function DashboardToolbar({ isFetching, onRefresh, errorMessage, showCurrency = true }: DashboardToolbarProps) {
  const filters = useDashboardFiltersStore((s) => s.filters)
  const setFilters = useDashboardFiltersStore((s) => s.setFilters)

  return (
    <div className='flex flex-col gap-2'>
      <DashboardFilters
        value={filters}
        onChange={setFilters}
        showCurrency={showCurrency}
        actions={
          <IconButton
            label={isFetching ? 'Actualizando…' : 'Actualizar'}
            onClick={onRefresh}
            disabled={isFetching}
            icon={isFetching ? <Loader2 className='animate-spin' /> : <RefreshCw />}
          />
        }
      />
      {errorMessage && (
        <p className='text-destructive flex items-center gap-1.5 text-xs'>
          <AlertCircle className='h-3.5 w-3.5' /> {errorMessage} Se muestran los últimos datos cargados.
        </p>
      )}
    </div>
  )
}
