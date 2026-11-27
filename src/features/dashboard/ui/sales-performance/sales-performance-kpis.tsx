'use client'

import { Ban, Banknote, CalendarRange, Hash, Landmark, Percent, Receipt, TrendingUp } from 'lucide-react'
import { formatMoney, formatNumber, formatPercent, KpiCard, type Currency } from '@/shared/ui/dashboard'
import type { SalesPerformanceKpisDto } from '../../model/dashboard-sales-performance.dto'

type Props = {
  kpis: SalesPerformanceKpisDto | undefined
  currency: Currency
}

export function SalesPerformanceKpis({ kpis, currency }: Props) {
  const isLoading = !kpis
  const money = (value: number | undefined) => formatMoney(value ?? 0, currency)

  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
      <KpiCard
        title='Total vendido'
        icon={Banknote}
        isLoading={isLoading}
        value={money(kpis?.sales_total)}
        changePct={kpis?.growth_vs_previous_pct ?? null}
      />
      <KpiCard
        title='Cantidad de ventas'
        icon={Hash}
        isLoading={isLoading}
        value={formatNumber(kpis?.sales_count)}
        description='Comprobantes no anulados'
      />
      <KpiCard
        title='Ticket promedio'
        icon={Receipt}
        isLoading={isLoading}
        value={money(kpis?.average_ticket)}
        description='Total vendido ÷ cantidad de ventas'
      />
      <KpiCard
        title='Crecimiento vs periodo anterior'
        icon={TrendingUp}
        isLoading={isLoading}
        value={formatPercent(kpis?.growth_vs_previous_pct ?? null, { signed: true })}
        description='Mismo número de días justo antes del rango'
      />
      <KpiCard
        title='Crecimiento vs año pasado'
        icon={CalendarRange}
        isLoading={isLoading}
        value={formatPercent(kpis?.growth_vs_last_year_pct ?? null, { signed: true })}
        description='Mismo rango de fechas del año anterior'
      />
      <KpiCard
        title='Descuentos otorgados'
        icon={Percent}
        isLoading={isLoading}
        value={money(kpis?.discount_total)}
        description='Suma de descuentos por línea'
      />
      <KpiCard
        title='IGV generado'
        icon={Landmark}
        isLoading={isLoading}
        value={money(kpis?.tax_total)}
        description='Impuesto de las ventas del periodo'
      />
      <KpiCard
        title='Ventas anuladas'
        icon={Ban}
        isLoading={isLoading}
        value={formatNumber(kpis?.cancelled_count)}
        description={`Por ${money(kpis?.cancelled_total)} (no suman en los totales)`}
      />
    </div>
  )
}
