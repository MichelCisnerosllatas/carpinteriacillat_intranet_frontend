'use client'

import { Banknote, Bot, FileClock, HandCoins, Mail, Receipt, Target, Wallet } from 'lucide-react'
import { formatMoney, formatNumber, formatPercent, KpiCard, type Currency } from '@/shared/ui/dashboard'
import type { SummaryKpisDto } from '../../model/dashboard-summary.dto'

type SummaryKpisProps = {
  kpis: SummaryKpisDto | undefined
  currency: Currency
}

export function SummaryKpis({ kpis, currency }: SummaryKpisProps) {
  const isLoading = !kpis
  const money = (value: number | undefined) => formatMoney(value ?? 0, currency)

  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
      <KpiCard
        title='Ventas del periodo'
        icon={Banknote}
        isLoading={isLoading}
        value={money(kpis?.sales_total)}
        changePct={kpis?.sales_growth_pct ?? null}
        description={`${formatNumber(kpis?.sales_count)} ventas · antes ${money(kpis?.sales_previous_total)}`}
      />
      <KpiCard
        title='Cobrado'
        icon={Wallet}
        isLoading={isLoading}
        value={money(kpis?.collected_total)}
        description='Pagos recibidos en el periodo'
      />
      <KpiCard
        title='Por cobrar'
        icon={HandCoins}
        isLoading={isLoading}
        value={money(kpis?.receivable_total)}
        description='Saldo pendiente histórico'
      />
      <KpiCard
        title='Ticket promedio'
        icon={Receipt}
        isLoading={isLoading}
        value={money(kpis?.average_ticket)}
        description='Monto promedio por venta'
      />
      <KpiCard
        title='Proformas pendientes'
        icon={FileClock}
        isLoading={isLoading}
        value={formatNumber(kpis?.proformas_pending_count)}
        description={`Cotizado: ${money(kpis?.proformas_pending_total)}`}
      />
      <KpiCard
        title='Mensajes nuevos'
        icon={Mail}
        isLoading={isLoading}
        value={formatNumber(kpis?.contact_messages_new_count)}
        description='Formulario de contacto sin atender'
      />
      <KpiCard
        title='Chats abiertos'
        icon={Bot}
        isLoading={isLoading}
        value={formatNumber(kpis?.chatbot_open_count)}
        description='Conversaciones del chatbot en curso'
      />
      <KpiCard
        title='Meta del mes'
        icon={Target}
        isLoading={isLoading}
        value={kpis?.goal_amount != null ? formatPercent(kpis.goal_progress_pct) : 'Sin meta'}
        progress={kpis?.goal_amount != null ? (kpis.goal_progress_pct ?? 0) : undefined}
        description={
          kpis?.goal_amount != null
            ? `Meta: ${money(kpis.goal_amount)}`
            : 'Registra la meta mensual para ver el avance'
        }
      />
    </div>
  )
}
