'use client'

import { AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import { SellerSelect } from '@/features/sellers'
import { BranchMultiSelect, useShowBranchFilter } from '@/features/company-branches'
import { useCan } from '@/features/auth/hooks/usePermission'
import { IconButton } from '@/shared/ui/icon-button'
import { Label } from '@/shared/ui/label'
import { DashboardFilters } from '@/shared/ui/dashboard'
import { useDashboardFiltersStore } from '../../stores/useDashboardFiltersStore'
import { SellerScopeLabel } from './seller-scope-label'

type DashboardToolbarProps = {
  isFetching: boolean
  onRefresh: () => void
  /** Error de una recarga cuando YA había datos en pantalla (se avisa sin borrar los gráficos). */
  errorMessage?: string | null
  showCurrency?: boolean
  /**
   * Muestra el filtro "Vendedor" y el texto "Mostrando: …". Solo en los dashboards de ventas y
   * proformas: mensajes y accesos no dependen del vendedor.
   */
  showSeller?: boolean
  /** Nombre del vendedor con el que respondió el backend (`period.seller_name`). */
  sellerName?: string | null
}

// Barra de filtros conectada al store compartido de dashboards.
export function DashboardToolbar({
  isFetching,
  onRefresh,
  errorMessage,
  showCurrency = true,
  showSeller = false,
  sellerName,
}: DashboardToolbarProps) {
  const filters = useDashboardFiltersStore((s) => s.filters)
  const setFilters = useDashboardFiltersStore((s) => s.setFilters)
  const sellerId = useDashboardFiltersStore((s) => s.sellerId)
  const setSellerId = useDashboardFiltersStore((s) => s.setSellerId)
  // Solo quien ve las ventas de todos puede elegir vendedor (el backend igual lo valida).
  const canViewAll = useCan('sales.view_all')
  const branchIds = useDashboardFiltersStore((s) => s.branchIds)
  const setBranchIds = useDashboardFiltersStore((s) => s.setBranchIds)
  // Solo si puede ver más de una sucursal (company_branches.view_all o varias asignadas).
  const showBranchFilter = useShowBranchFilter()

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
      >
        {showSeller && canViewAll && (
          <div className='grid w-full gap-1.5 sm:w-56'>
            <Label className='text-muted-foreground text-xs'>Vendedor</Label>
            <SellerSelect value={sellerId} onValueChange={setSellerId} showAll />
          </div>
        )}
        {showSeller && showBranchFilter && (
          <div className='grid w-full gap-1.5 sm:w-56'>
            <Label className='text-muted-foreground text-xs'>Sucursales</Label>
            <BranchMultiSelect value={branchIds} onValueChange={setBranchIds} className='h-9' />
          </div>
        )}
      </DashboardFilters>

      {showSeller && <SellerScopeLabel canViewAll={canViewAll} sellerId={sellerId} sellerName={sellerName} />}

      {errorMessage && (
        <p className='text-destructive flex items-center gap-1.5 text-xs'>
          <AlertCircle className='h-3.5 w-3.5' /> {errorMessage} Se muestran los últimos datos cargados.
        </p>
      )}
    </div>
  )
}
