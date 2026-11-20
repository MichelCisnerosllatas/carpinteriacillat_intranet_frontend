'use client'

import type { ReactNode } from 'react'
import { ClientSelect } from '@/features/clients'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { DashboardFilters } from '@/shared/ui/dashboard'
import type { ReportConfig } from '../data/reports.config'
import { useReportStore } from '../stores/useReportStore'

// Radix Select no admite value="" para "Todos", así que se usa este valor especial.
const ALL = '__all__'

// Filtros compartidos por todas las pestañas: periodo + moneda, y cliente/estado
// solo cuando el reporte de la pestaña activa los usa.
export function ReportFilters({ config, actions }: { config: ReportConfig; actions: ReactNode }) {
  const filters = useReportStore((s) => s.filters)
  const clientId = useReportStore((s) => s.clientId)
  const status = useReportStore((s) => s.status)
  const setFilters = useReportStore((s) => s.setFilters)
  const setClientId = useReportStore((s) => s.setClientId)
  const setStatus = useReportStore((s) => s.setStatus)

  return (
    <DashboardFilters value={filters} onChange={setFilters} showCurrency={config.usesCurrency} actions={actions}>
      {config.usesClient && (
        <div className='grid w-full gap-1.5 sm:w-64'>
          <Label className='text-muted-foreground text-xs'>Cliente</Label>
          <ClientSelect value={clientId} onValueChange={setClientId} showAll placeholder='Todos' />
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
