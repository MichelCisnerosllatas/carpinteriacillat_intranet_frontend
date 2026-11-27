'use client'

import { Coins, Hash, Percent, type LucideIcon } from 'lucide-react'
import { KpiCard, type Currency } from '@/shared/ui/dashboard'
import { formatReportCell } from '../lib/format-cell'
import type { ReportKpiDto, ReportValueType } from '../model/report.dto'

// Ícono según el tipo de dato: así no hace falta configurar un ícono por cada KPI.
const KPI_ICONS: Partial<Record<ReportValueType, LucideIcon>> = {
  money: Coins,
  percent: Percent,
}

type Props = {
  kpis: ReportKpiDto[] | undefined
  currency: Currency
  isLoading?: boolean
}

// Fila de indicadores del reporte. Los KPIs vienen ya calculados por el backend.
export function ReportKpis({ kpis, currency, isLoading = false }: Props) {
  if (isLoading && !kpis) {
    return (
      <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiCard key={i} title='' value='' icon={Hash} isLoading />
        ))}
      </div>
    )
  }
  if (!kpis || kpis.length === 0) return null

  return (
    <div className='grid grid-cols-2 gap-3 lg:grid-cols-4 2xl:grid-cols-6'>
      {kpis.map((kpi) => (
        <KpiCard
          key={kpi.key}
          title={kpi.label}
          value={formatReportCell(kpi.value, kpi.type, currency)}
          icon={KPI_ICONS[kpi.type] ?? Hash}
        />
      ))}
    </div>
  )
}
