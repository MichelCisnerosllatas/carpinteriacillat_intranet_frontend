'use client'

import { BadgeCheck, FileStack, HandCoins, Repeat } from 'lucide-react'
import { formatMoney, formatNumber, formatPercent, KpiCard, type Currency } from '@/shared/ui/dashboard'
import type { ProformasKpisDto } from '../../model/dashboard-proformas.dto'

type Props = {
  kpis: ProformasKpisDto | undefined
  currency: Currency
}

export function ProformasKpis({ kpis, currency }: Props) {
  const isLoading = !kpis

  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
      <KpiCard
        title='Proformas emitidas'
        icon={FileStack}
        isLoading={isLoading}
        value={formatNumber(kpis?.total_count)}
        description={`Cotizado: ${formatMoney(kpis?.quoted_total ?? 0, currency)}`}
      />
      <KpiCard
        title='Tasa de aceptación'
        icon={BadgeCheck}
        isLoading={isLoading}
        value={formatPercent(kpis?.accepted_rate_pct ?? null)}
        progress={kpis?.accepted_rate_pct ?? 0}
        description={`${formatNumber(kpis?.accepted_count)} aceptadas (incluye convertidas)`}
      />
      <KpiCard
        title='Tasa de conversión'
        icon={Repeat}
        isLoading={isLoading}
        value={formatPercent(kpis?.conversion_rate_pct ?? null)}
        progress={kpis?.conversion_rate_pct ?? 0}
        description={`${formatNumber(kpis?.converted_count)} convertidas en venta`}
      />
      <KpiCard
        title='Vendido desde proformas'
        icon={HandCoins}
        isLoading={isLoading}
        value={formatMoney(kpis?.sold_from_proformas_total ?? 0, currency)}
        description='Ventas no anuladas generadas desde una proforma'
      />
    </div>
  )
}
