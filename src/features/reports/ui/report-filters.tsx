'use client'

import type { ReactNode } from 'react'
import { ClientSelect } from '@/features/clients'
import { SellerSelect } from '@/features/sellers'
import { BranchMultiSelect, useShowBranchFilter } from '@/features/company-branches'
import { useCan } from '@/features/auth/hooks/usePermission'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { DashboardFilters } from '@/shared/ui/dashboard'
import type { ReportConfig } from '../data/reports.config'
import { useReportStore } from '../stores/useReportStore'

// Radix Select no admite value="" para "Todos", así que se usa este valor especial.
const ALL = '__all__'

// Filtros compartidos por todas las pestañas: periodo + moneda, y vendedor/cliente/estado
// solo cuando el reporte de la pestaña activa los usa.
export function ReportFilters({ config, actions }: { config: ReportConfig; actions: ReactNode }) {
  const filters = useReportStore((s) => s.filters)
  const clientId = useReportStore((s) => s.clientId)
  const status = useReportStore((s) => s.status)
  const setFilters = useReportStore((s) => s.setFilters)
  const setClientId = useReportStore((s) => s.setClientId)
  const setStatus = useReportStore((s) => s.setStatus)
  const sellerId = useReportStore((s) => s.sellerId)
  const setSellerId = useReportStore((s) => s.setSellerId)
  // Solo quien ve las ventas de todos puede filtrar por vendedor.
  const canViewAll = useCan('sales.view_all')
  const branchIds = useReportStore((s) => s.branchIds)
  const setBranchIds = useReportStore((s) => s.setBranchIds)
  // Solo si puede ver más de una sucursal (company_branches.view_all o varias asignadas).
  const showBranchFilter = useShowBranchFilter()

  return (
    <DashboardFilters value={filters} onChange={setFilters} showCurrency={config.usesCurrency} actions={actions}>
      {config.usesClient && (
        <div className='grid w-full gap-1.5 sm:w-64'>
          <Label className='text-muted-foreground text-xs'>Cliente</Label>
          <ClientSelect value={clientId} onValueChange={setClientId} showAll />
        </div>
      )}

      {config.usesSeller && canViewAll && (
        <div className='grid w-full gap-1.5 sm:w-56'>
          <Label className='text-muted-foreground text-xs'>Vendedor</Label>
          <SellerSelect value={sellerId} onValueChange={setSellerId} showAll />
        </div>
      )}

      {config.usesSeller && showBranchFilter && (
        <div className='grid w-full gap-1.5 sm:w-56'>
          <Label className='text-muted-foreground text-xs'>Sucursales</Label>
          <BranchMultiSelect value={branchIds} onValueChange={setBranchIds} className='h-9' />
        </div>
      )}

      {config.statusOptions && (
        <div className='grid w-full gap-1.5 sm:w-44'>
          <Label className='text-muted-foreground text-xs'>Estado</Label>
          <Select value={status ?? ALL} onValueChange={(v) => setStatus(v === ALL ? null : v)}>
            <SelectTrigger className='w-full'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos</SelectItem>
              {config.statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </DashboardFilters>
  )
}
